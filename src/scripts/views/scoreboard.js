import $ from 'jquery'
import _ from 'underscore'
import View from './base'
import moment from 'moment'
import identityProvider from '../providers/identity'
import teamProvider from '../providers/team'
import URLSearchParams from 'url-search-params'
import countryProvider from '../providers/country'

import teamRankingProvider from '../providers/team-ranking'

class ScoreboardView extends View {
  constructor () {
    super()
    this.$main = null

    this.onUpdateTeamLogo = null
    this.onUpdateTeamProfile = null

    this.onUpdateTeamRankings = null

    this.onReloadScoreboard = null
    this.reloadScoreboard = false
    this.reloadScoreboardInterval = null
    this.renderingScoreboard = false

    this.detailed = false
  }

  renderScoreboard () {
    this.$main.find('section').html(window.themis.quals.templates.scoreboardTable({
      _: _,
      moment: moment,
      detailed: this.detailed,
      templates: window.themis.quals.templates,
      teams: teamProvider.getTeams(),
      teamRankings: teamRankingProvider.getTeamRankings(),
      countries: countryProvider.getCountries(),
      identity: identityProvider.getIdentity(),
      printLayout: false,
      lastUpdated: new Date()
    }))
  }

  present () {
    this.$main = $('#main')

    $
    .when(
      teamProvider.initTeams(),
      countryProvider.initCountries()
    )
    .done((teams, countries) => {
      let urlParams = new URLSearchParams(window.location.search)
      this.detailed = urlParams.has('detailed')

      teamProvider.subscribe()

      this.onUpdateTeamRankings = () => {
        this.reloadScoreboard = true
        return false
      }
      teamRankingProvider.on('updateTeamRankings', this.onUpdateTeamRankings)

      this.onUpdateTeamLogo = (team) => {
        const teamId = team.id
        setTimeout(() => {
          let el = document.getElementById(`team-${teamId}-logo`)
          if (el) {
            el.setAttribute('src', `/team/logo/${teamId}.png?timestamp=${(new Date()).getTime()}`)
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
  }
}

export default new ScoreboardView()
