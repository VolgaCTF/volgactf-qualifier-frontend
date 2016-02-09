import $ from 'jquery'
import View from './base'
import renderTemplate from '../utils/render-template'
import dataStore from '../data-store'
import navigationBar from '../navigation-bar'
import statusBar from '../status-bar'
import metadataStore from '../utils/metadata-store'
import contestProvider from '../providers/contest'
import identityProvider from '../providers/identity'


class IndexView extends View {
  constructor() {
    super(/^\/$/)
    this.$main = null
    this.onUpdateContest = null
  }

  getTitle() {
    return `${metadataStore.getMetadata('event-title')} :: Main`
  }

  render() {
    let identity = identityProvider.getIdentity()
    let contest = contestProvider.getContest()
    this.$main.empty()
    this.$main.html(renderTemplate('index-view', {
      identity: identity,
      contest: contest
    }))
  }

  present() {
    this.$main = $('#main')
    this.$main.html(renderTemplate('loading-view'))

    $
      .when(identityProvider.fetchIdentity())
      .done((identity) => {
        let promise = null
        if (identity.role === 'team') {
          promise = $.when(contestProvider.fetchContest(), contestProvider.fetchTeamScores())
        } else {
          promise = $.when(contestProvider.fetchContest())
        }

        promise
          .done(() => {
            identityProvider.subscribe()
            if (dataStore.supportsRealtime()) {
              dataStore.connectRealtime()
            }

            navigationBar.present()
            statusBar.present()

            this.render()

            this.onUpdateContest = (e) => {
              this.render()
              return false
            }

            contestProvider.on('updateContest', this.onUpdateContest)
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

    if (this.onUpdateContest) {
      contestProvider.off('updateContest', this.onUpdateContest)
      this.onUpdateContest = null
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


export default new IndexView()
