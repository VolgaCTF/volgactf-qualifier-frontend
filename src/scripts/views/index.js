import $ from 'jquery'
import View from './base'
import dataStore from '../data-store'
import newNavigationBar from '../new-navigation-bar'
import newStatusBar from '../new-status-bar'
import metadataStore from '../utils/metadata-store'
import contestProvider from '../providers/contest'
import identityProvider from '../providers/identity'

class IndexView extends View {
  constructor () {
    super(/^\/$/)
    this.$main = null
    this.onUpdateContest = null
  }

  getTitle () {
    return `${metadataStore.getMetadata('event-title')} :: Main`
  }

  render () {
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
          .done(() => {
            identityProvider.subscribe()
            if (dataStore.supportsRealtime()) {
              dataStore.connectRealtime()
            }

            newNavigationBar.present()
            newStatusBar.present()

            this.onUpdateContest = (e) => {
              this.render()
              return false
            }

            contestProvider.on('updateContest', this.onUpdateContest)
          })
      })
  }

  dismiss () {
    identityProvider.unsubscribe()

    if (this.onUpdateContest) {
      contestProvider.off('updateContest', this.onUpdateContest)
      this.onUpdateContest = null
    }

    this.$main.empty()
    this.$main = null
    newNavigationBar.dismiss()
    newStatusBar.dismiss()

    if (dataStore.supportsRealtime()) {
      dataStore.disconnectRealtime()
    }
  }
}

export default new IndexView()
