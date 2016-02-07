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
import History from 'jquery.History'


class ScoreboardView extends View {
  constructor() {
    this.$main = null

    this.onUpdateTeamScore = null

    this.onReloadScoreboard = null
    this.reloadScoreboard = false
    this.reloadScoreboardInterval = null
    this.renderingScoreboard = false

    this.detailed = false

    this.urlRegex = /^\/scoreboard$/
  }

  getTitle() {
    return `${metadataStore.getMetadata('event-title')} :: Scoreboard`
  }

  renderScoreboard() {
    let $tableBody = $('#themis-scoreboard-table-body')
    $tableBody.empty()

    let teamScores = contestProvider.getTeamScores()
    let teams = teamProvider.getTeams()

    let identity = identityProvider.getIdentity()
    let isTeam = (identity.role === 'team')

    teamScores.sort(contestProvider.teamRankFunc)
    _.each(teamScores, (teamScore, ndx) => {
      team = _.findWhere(teams, { id: teamScore.teamId })
      if (team) {
        let obj = {
          rank: ndx + 1,
          id: team.id,
          name: team.name,
          score: teamScore.score,
          updatedAt: (teamScore.updatedAt)? moment(teamScore.updatedAt).format('lll') : 'never',
          highlight: (isTeam && team.id === identity.id),
          detailed: this.detailed
        }

        if (this.detailed) {
          obj.country = team.country
          obj.locality = team.locality
          obj.institution = team.institution
        }

        $tableBody.append($(renderTemplate('scoreboard-table-row-partial', obj)))
      }
    })
  }

  present() {
    this.$main = $('#main')
    this.$main.html(renderTemplate('loading-view'))

    $
      .when(
        identityProvider.fetchIdentity(),
        contestProvider.fetchContest(),
        teamProvider.fetchTeams(),
        contestProvider.fetchTeamScores()
      )
      .done((identity, contest, teams, teamScores) => {
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

        this.onReloadScoreboard = () => {
          if (!this.reloadScoreboard || this.renderingScoreboard) {
            return
          }

          this.renderingScoreboard = true
          this.renderScoreboard()
          this.reloadScoreboard = false
          this.renderingScoreboard = false
        }

        this.reloadScoreboardInterval = setInterval(this.onReloadScoreboard, 1000)
      })
      .fail(() => {
        navigationBar.present()
        this.$main.html(renderTemplate('internal-error-view'))
      })
  }

  dismiss() {
    identityProvider.unsubscribe()
    teamProvider.unsubscribe()

    if (this.onUpdateTeamScore) {
      contestProvider.off('updateTeamScore', this.onUpdateTeamScore)
      this.onUpdateTeamScore = null
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
