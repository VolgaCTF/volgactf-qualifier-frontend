import $ from 'jquery'
import _ from 'underscore'
import View from './base'
import navigationBar from '../new-navigation-bar'
import statusBar from '../new-status-bar'
import contestProvider from '../providers/contest'
import identityProvider from '../providers/identity'
import teamProvider from '../providers/team'
import countryProvider from '../providers/country'

class TeamsView extends View {
  constructor () {
    super()
    this.$main = null

    this.onUpdateTeamProfile = null
    this.onUpdateTeamLogo = null
    this.onCreateTeam = null
    this.onUpdateTeamEmail = null
    this.onQualifyTeam = null
    this.onDisqualifyTeam = null
  }

  renderTeams () {
    let countries = countryProvider.getCountries()
    let teams = teamProvider.getTeams()
    this.$main.find('.themis-team-count').text(`(${teams.length})`)
    this.$main.find('section').html(window.themis.quals.templates.teamList({
      _: _,
      teams: teams,
      countries: countries,
      templates: window.themis.quals.templates
    }))
  }

  present () {
    this.$main = $('#main')

    $
    .when(
      identityProvider.initIdentity(),
      contestProvider.initContest(),
      teamProvider.initTeams(),
      countryProvider.initCountries()
    )
    .done((identity) => {
      identityProvider.subscribe()

      navigationBar.present()
      statusBar.present()

      teamProvider.subscribe()

      this.onUpdateTeamProfile = (team) => {
        this.renderTeams()
        return false
      }

      teamProvider.on('updateTeamProfile', this.onUpdateTeamProfile)

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

      this.onQualifyTeam = (team) => {
        this.renderTeams()
        return false
      }

      teamProvider.on('qualifyTeam', this.onQualifyTeam)

      this.onDisqualifyTeam = (team) => {
        this.renderTeams()
        return false
      }

      teamProvider.on('disqualifyTeam', this.onDisqualifyTeam)

      if (identity.isSupervisor()) {
        this.onCreateTeam = (team) => {
          this.renderTeams()
          return false
        }

        teamProvider.on('createTeam', this.onCreateTeam)

        this.onUpdateTeamEmail = (team) => {
          this.renderTeams()
          return false
        }

        teamProvider.on('updateTeamEmail', this.onUpdateTeamEmail)
      }
    })
  }
}

export default new TeamsView()
