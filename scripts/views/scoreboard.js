import $ from 'jquery'
import _ from 'underscore'
import View from './base'
import renderTemplate from '../utils/render-template'
import dataStore from '../data-store'
import navigationBar from '../navigation-bar'
import statusBar from '../status-bar'
import metadataStore from '../utils/metadata-store'
import moment from 'moment'
import contestProvider from '../providers/contest'
import identityProvider from '../providers/identity'
import teamProvider from '../providers/team'
import History from 'history.js'
import countryProvider from '../providers/country'

class ScoreboardView extends View {
  constructor () {
    super(/^\/scoreboard$/)
    this.$main = null

    this.onUpdateTeamScore = null
    this.onUpdateTeamLogo = null
    this.onUpdateTeamProfile = null

    this.onReloadScoreboard = null
    this.reloadScoreboard = false
    this.reloadScoreboardInterval = null
    this.renderingScoreboard = false

    this.detailed = false
  }

  getTitle () {
    return `${metadataStore.getMetadata('event-title')} :: Scoreboard`
  }

  renderScoreboard () {
    let $tableBody = $('#themis-scoreboard-table-body')
    $tableBody.empty()

    let teamScores = contestProvider.getTeamScores()
    let teams = teamProvider.getTeams()
    let countries = countryProvider.getCountries()

    let identity = identityProvider.getIdentity()

    teamScores.sort(contestProvider.teamRankFunc)
    _.each(teamScores, (teamScore, ndx) => {
      let team = _.findWhere(teams, { id: teamScore.teamId })
      if (team) {
        let country = _.findWhere(countries, { id: team.countryId })

        let obj = {
          rank: ndx + 1,
          id: team.id,
          name: team.name,
          country: country.name,
          score: teamScore.score,
          updatedAt: (teamScore.updatedAt) ? moment(teamScore.updatedAt).format('lll') : 'never',
          highlight: identity.isExactTeam(team.id),
          detailed: this.detailed
        }

        if (this.detailed) {
          obj.locality = team.locality
          obj.institution = team.institution
        }

        $tableBody.append($(renderTemplate('scoreboard-table-row-partial', obj)))
      }
    })
  }

  present () {
    this.$main = $('#main')
    this.$main.html(renderTemplate('loading-view'))

    $
      .when(
        identityProvider.fetchIdentity(),
        contestProvider.fetchContest(),
        teamProvider.fetchTeams(),
        contestProvider.fetchTeamScores(),
        countryProvider.fetchCountries()
      )
      .done((identity, contest, teams, teamScores, countries) => {
        if (dataStore.supportsRealtime()) {
          dataStore.connectRealtime()
        }

        identityProvider.subscribe()

        let params = History.getState().data.params
        this.detailed = (params.full)

        this.$main.html(renderTemplate('scoreboard-view', {
          identity: identity,
          detailed: this.detailed
        }))

        teamProvider.subscribe()

        navigationBar.present({ active: 'scoreboard' })
        statusBar.present()

        this.renderScoreboard()

        this.onUpdateTeamScore = (teamScore) => {
          this.reloadScoreboard = true
          return false
        }

        contestProvider.on('updateTeamScore', this.onUpdateTeamScore)

        this.onUpdateTeamLogo = (team) => {
          const teamId = team.id
          setTimeout(() => {
            let el = document.getElementById(`team-${teamId}-logo`)
            if (el) {
              el.setAttribute('src', `/api/team/${teamId}/logo?timestamp=${(new Date()).getTime()}`)
            }
          }, 500)
          return false
        }

        teamProvider.on('updateTeamLogo', this.onUpdateTeamLogo)

        this.onUpdateTeamProfile = () => {
          this.reloadScoreboard = true
          return false
        }

        teamProvider.on('updateTeamProfile', this.onUpdateTeamProfile)

        this.onReloadScoreboard = () => {
          if (!this.reloadScoreboard || this.renderingScoreboard) {
            return
          }

          this.renderingScoreboard = true
          this.renderScoreboard()
          this.reloadScoreboard = false
          this.renderingScoreboard = false
        }

        this.reloadScoreboardInterval = setInterval(this.onReloadScoreboard, 1500)
      })
      .fail(() => {
        navigationBar.present()
        this.$main.html(renderTemplate('internal-error-view'))
      })
  }

  dismiss () {
    identityProvider.unsubscribe()
    teamProvider.unsubscribe()

    if (this.onUpdateTeamScore) {
      contestProvider.off('updateTeamScore', this.onUpdateTeamScore)
      this.onUpdateTeamScore = null
    }

    if (this.onUpdateTeamLogo) {
      teamProvider.off('updateTeamLogo', this.onUpdateTeamLogo)
      this.onUpdateTeamLogo = null
    }

    if (this.onUpdateTeamProfile) {
      teamProvider.off('updateTeamProfile', this.onUpdateTeamProfile)
      this.onUpdateTeamProfile = null
    }

    if (this.reloadScoreboardInterval) {
      clearInterval(this.reloadScoreboardInterval)
      this.reloadScoreboardInterval = null
      this.renderingScoreboard = false
      this.reloadScoreboard = false
    }

    this.$main.empty()
    this.$main = null
    navigationBar.dismiss()
    statusBar.dismiss()

    if (dataStore.supportsRealtime()) {
      dataStore.disconnectRealtime()
    }
  }
}

export default new ScoreboardView()
