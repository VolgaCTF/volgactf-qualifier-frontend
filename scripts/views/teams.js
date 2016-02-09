import $ from 'jquery'
import _ from 'underscore'
import View from './base'
import renderTemplate from '../utils/render-template'
import dataStore from '../data-store'
import navigationBar from '../navigation-bar'
import statusBar from '../status-bar'
import metadataStore from '../utils/metadata-store'
import teamModel from '../models/team'
import contestProvider from '../providers/contest'
import identityProvider from '../providers/identity'
import teamProvider from '../providers/team'


class TeamsView extends View {
  constructor() {
    super(/^\/teams$/)
    this.$main = null

    this.onUpdateTeamProfile = null
    this.onCreateTeam = null
    this.onChangeTeamEmail = null
    this.onQualifyTeam = null
  }

  getTitle() {
    return `${metadataStore.getMetadata('event-title')} :: Teams`
  }

  renderTeams() {
    let sortedTeams = _.sortBy(teamProvider.getTeams(), 'createdAt')
    this.$main.find('.themis-team-count').show().html(renderTemplate('team-count-partial', { count: sortedTeams.length }))

    let $section = this.$main.find('section')
    $section.empty()

    let $content = $('<ul></ul>').addClass('themis-teams list-unstyled')
    let identity = identityProvider.getIdentity()
    for (let team of sortedTeams) {
      $content.append($('<li></li>').html(renderTemplate('team-profile-simplified-partial', {
        identity: identity,
        team: team
      })))
    }
    $section.html($content)
  }

  present() {
    this.$main = $('#main')
    this.$main.html(renderTemplate('loading-view'))

    $
      .when(identityProvider.fetchIdentity())
      .done((identity) => {
        let promise = null
        if (identity.role === 'team') {
          promise = $.when(contestProvider.fetchContest(), teamProvider.fetchTeams(), contestProvider.fetchTeamScores())
        } else {
          promise = $.when(contestProvider.fetchContest(), teamProvider.fetchTeams())
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
            let $section = this.$main.find('section')

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

            if (_.contains(['admin', 'manager'], identity.role)) {
              this.onCreateTeam = (team) => {
                this.renderTeams()
                return false
              }

              teamProvider.on('createTeam', this.onCreateTeam)

              this.onChangeTeamEmail = (team) => {
                this.renderTeams()
                return false
              }

              teamProvider.on('changeTeamEmail', this.onChangeTeamEmail)
            }
          })
          .fail((err) => {
            navigationBar.present()
            this.$main.html(renderTemplate('internal-error-view'))
          })
      })
      .fail((err) => {
        navigationBar.present()
        this.$main.html(renderTemplate('internal-error-view'))
      })
  }

  dismiss() {
    identityProvider.unsubscribe()

    if (this.onUpdateTeamProfile) {
      teamProvider.off('updateTeamProfile', this.onUpdateTeamProfile)
      this.onUpdateTeamProfile = null
    }

    if (this.onCreateTeam) {
      teamProvider.off('createTeam', this.onCreateTeam)
      this.onCreateTeam = null
    }

    if (this.onChangeTeamEmail) {
      teamProvider.off('changeTeamEmail', this.onChangeTeamEmail)
      this.onChangeTeamEmail = null
    }

    if (this.onQualifyTeam) {
      teamProvider.off('qualifyTeam', this.onQualifyTeam)
      this.onQualifyTeam = null
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
