import $ from 'jquery'
import _ from 'underscore'
import View from './base'
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
    this.$main.find('.volgactf-team-count').text(`(${teams.length})`)
    this.$main.find('section').html(window.volgactf.qualifier.templates.teamList({
      _: _,
      teams: teams,
      countries: countries,
      templates: window.volgactf.qualifier.templates
    }))
  }

  present () {
    this.$main = $('#main')

    $
    .when(
      teamProvider.initTeams(),
      countryProvider.initCountries()
    )
    .done(() => {
      const identity = identityProvider.getIdentity()

      teamProvider.subscribe()

      this.onUpdateTeamProfile = (team) => {
        this.renderTeams()
        return false
      }

      teamProvider.on('updateTeamProfile', this.onUpdateTeamProfile)

      this.onUpdateTeamLogo = (team) => {
        const el = document.getElementById(`team-${team.id}-logo`)
        if (el) {
          el.setAttribute('src', `/team/logo/${team.id}/${team.logoChecksum}`)
        }
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
