import $ from 'jquery'
import _ from 'underscore'
import View from './base'
import dataStore from '../data-store'
import newNavigationBar from '../new-navigation-bar'
import newStatusBar from '../new-status-bar'
import metadataStore from '../utils/metadata-store'
import contestProvider from '../providers/contest'
import identityProvider from '../providers/identity'
import teamProvider from '../providers/team'
import countryProvider from '../providers/country'

class TeamsView extends View {
  constructor () {
    super(/^\/teams$/)
    this.$main = null

    this.onUpdateTeamProfile = null
    this.onUpdateTeamLogo = null
    this.onCreateTeam = null
    this.onUpdateTeamEmail = null
    this.onQualifyTeam = null
    this.onDisqualifyTeam = null
  }

  getTitle () {
    return `${metadataStore.getMetadata('event-title')} :: Teams`
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
      .when(identityProvider.initIdentity())
      .done((identity) => {
        let promise = null
        if (identity.isTeam()) {
          promise = $.when(
            contestProvider.initContest(),
            teamProvider.initTeams(),
            countryProvider.initCountries(),
            contestProvider.initTeamScores()
          )
        } else {
          promise = $.when(
            contestProvider.initContest(),
            teamProvider.initTeams(),
            countryProvider.initCountries()
          )
        }

        promise
          .done(() => {
            identityProvider.subscribe()
            if (dataStore.supportsRealtime()) {
              dataStore.connectRealtime()
            }

            newNavigationBar.present()
            newStatusBar.present()

            // this.renderTeams()

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
      })
  }

  dismiss () {
    identityProvider.unsubscribe()

    if (this.onUpdateTeamProfile) {
      teamProvider.off('updateTeamProfile', this.onUpdateTeamProfile)
      this.onUpdateTeamProfile = null
    }

    if (this.onUpdateTeamLogo) {
      teamProvider.off('updateTeamLogo', this.onUpdateTeamLogo)
      this.onUpdateTeamLogo = null
    }

    if (this.onCreateTeam) {
      teamProvider.off('createTeam', this.onCreateTeam)
      this.onCreateTeam = null
    }

    if (this.onUpdateTeamEmail) {
      teamProvider.off('updateTeamEmail', this.onUpdateTeamEmail)
      this.onUpdateTeamEmail = null
    }

    if (this.onQualifyTeam) {
      teamProvider.off('qualifyTeam', this.onQualifyTeam)
      this.onQualifyTeam = null
    }

    if (this.onDisqualifyTeam) {
      teamProvider.off('disqualifyTeam', this.onDisqualifyTeam)
      this.onDisqualifyTeam = null
    }

    teamProvider.unsubscribe()

    this.$main.empty()
    this.$main = null
    newNavigationBar.dismiss()
    newStatusBar.dismiss()

    if (dataStore.supportsRealtime()) {
      dataStore.disconnectRealtime()
    }
  }
}

export default new TeamsView()
