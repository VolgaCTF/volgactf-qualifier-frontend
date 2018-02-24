import $ from 'jquery'
import View from './base'
import dataStore from '../data-store'
import newNavigationBar from '../new-navigation-bar'
import newStatusBar from '../new-status-bar'
import metadataStore from '../utils/metadata-store'
import contestProvider from '../providers/contest'
import identityProvider from '../providers/identity'

class AboutView extends View {
  constructor () {
    super(/^\/about$/)
    this.$main = null
  }

  getTitle () {
    return `${metadataStore.getMetadata('event-title')} :: About`
  }

  present () {
    this.$main = $('#main')

    $
      .when(identityProvider.initIdentity())
      .done((identity) => {
        let promise = null
        if (identity.isTeam()) {
          promise = $.when(contestProvider.initContest(), contestProvider.initTeamScores())
        } else {
          promise = $.when(contestProvider.initContest())
        }

        promise
          .done((contest) => {
            identityProvider.subscribe()

            if (dataStore.supportsRealtime()) {
              dataStore.connectRealtime()
            }

            newNavigationBar.present()
            newStatusBar.present()
          })
      })
  }

  dismiss () {
    identityProvider.unsubscribe()

    this.$main.empty()
    newNavigationBar.dismiss()
    newStatusBar.dismiss()

    if (dataStore.supportsRealtime()) {
      dataStore.disconnectRealtime()
    }
  }
}

export default new AboutView()
