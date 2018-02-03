import $ from 'jquery'
import View from './base'
import renderTemplate from '../utils/render-template'
import dataStore from '../data-store'
import navigationBar from '../navigation-bar'
import statusBar from '../status-bar'
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
    this.$main.html(renderTemplate('loading-view'))

    $
      .when(identityProvider.fetchIdentity())
      .done((identity) => {
        let promise = null
        if (identity.isTeam()) {
          promise = $.when(contestProvider.fetchContest(), contestProvider.fetchTeamScores())
        } else {
          promise = $.when(contestProvider.fetchContest())
        }

        promise
          .done((contest) => {
            this.$main.html(renderTemplate('about-view', { identity: identity }))
            identityProvider.subscribe()

            if (dataStore.supportsRealtime()) {
              dataStore.connectRealtime()
            }

            navigationBar.present({ active: 'about' })
            statusBar.present()
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

    this.$main.empty()
    navigationBar.dismiss()
    statusBar.dismiss()

    if (dataStore.supportsRealtime()) {
      dataStore.disconnectRealtime()
    }
  }
}

export default new AboutView()
