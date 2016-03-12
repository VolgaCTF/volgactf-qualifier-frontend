import $ from 'jquery'
import _ from 'underscore'
import View from './base'
import renderTemplate from '../utils/render-template'
import dataStore from '../data-store'
import navigationBar from '../navigation-bar'
import statusBar from '../status-bar'
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
    let sortedTeams = _.sortBy(teamProvider.getTeams(), 'createdAt')
    this.$main.find('.themis-team-count').show().html(renderTemplate('team-count-partial', { count: sortedTeams.length }))

    let $section = this.$main.find('section')
    $section.empty()

    let $content = $('<ul></ul>').addClass('themis-teams list-unstyled')
    let identity = identityProvider.getIdentity()
    for (let team of sortedTeams) {
      let country = _.findWhere(countries, { id: team.countryId })
      $content.append($('<li></li>').html(renderTemplate('team-profile-simplified-partial', {
        identity: identity,
        team: team,
        country: country.name
      })))
    }
    $section.html($content)
  }

  present () {
    this.$main = $('#main')
    this.$main.html(renderTemplate('loading-view'))

    $
      .when(identityProvider.fetchIdentity())
      .done((identity) => {
        let promise = null
        if (identity.isTeam()) {
          promise = $.when(
            contestProvider.fetchContest(),
            teamProvider.fetchTeams(),
            countryProvider.fetchCountries(),
            contestProvider.fetchTeamScores()
          )
        } else {
          promise = $.when(
            contestProvider.fetchContest(),
            teamProvider.fetchTeams(),
            countryProvider.fetchCountries()
          )
        }

        promise
          .done(() => {
            identityProvider.subscribe()
            if (dataStore.supportsRealtime()) {
              dataStore.connectRealtime()
            }

            navigationBar.present({ active: 'teams' })
            statusBar.present()

            this.$main.html(renderTemplate('teams-view', { identity: identity }))

            this.renderTeams()

            teamProvider.subscribe()

            this.onUpdateTeamProfile = (team) => {
              this.renderTeams()
              return false
            }

            teamProvider.on('updateTeamProfile', this.onUpdateTeamProfile)

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
          .fail((err) => {
            console.error(err)
            navigationBar.present()
            this.$main.html(renderTemplate('internal-error-view'))
          })
      })
      .fail((err) => {
        console.error(err)
        navigationBar.present()
        this.$main.html(renderTemplate('internal-error-view'))
      })
  }

  dismiss () {
    identityProvider.unsubscribe()

    if (this.onUpdateTeamProfile) {
      teamProvider.off('updateTeamProfile', this.onUpdateTeamProfile)
      this.onUpdateTeamProfile = null
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
    navigationBar.dismiss()
    statusBar.dismiss()

    if (dataStore.supportsRealtime()) {
      dataStore.disconnectRealtime()
    }
  }
}

export default new TeamsView()
