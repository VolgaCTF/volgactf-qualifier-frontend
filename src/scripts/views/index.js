import $ from 'jquery'
import View from './base'
import renderTemplate from '../utils/render-template'
import dataStore from '../data-store'
import newNavigationBar from '../new-navigation-bar'
import newStatusBar from '../new-status-bar'
import metadataStore from '../utils/metadata-store'
import contestProvider from '../providers/contest'
import identityProvider from '../providers/identity'
import _ from 'underscore'

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
    let identity = identityProvider.getIdentity()
    let contest = contestProvider.getContest()
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

            this.render()

            this.onUpdateContest = (e) => {
              this.render()
              return false
            }

            contestProvider.on('updateContest', this.onUpdateContest)
          })
          .fail((err) => {
            console.error(err)
            newNavigationBar.present()
            this.$main.html(renderTemplate('internal-error-view'))
          })
      })
      .fail((err) => {
        console.error(err)
        newNavigationBar.present()
        this.$main.html(renderTemplate('internal-error-view'))
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
