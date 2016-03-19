import $ from 'jquery'
import View from '../base'
import renderTemplate from '../../utils/render-template'
import dataStore from '../../data-store'
import navigationBar from '../../navigation-bar'
import statusBar from '../../status-bar'
import metadataStore from '../../utils/metadata-store'
import contestProvider from '../../providers/contest'
import identityProvider from '../../providers/identity'

class TaskStatisticsView extends View {
  constructor () {
    super(/^\/task\/[0-9]{1,5}\/statistics$/)
    this.$main = null
  }

  getTitle () {
    return `${metadataStore.getMetadata('event-title')} :: Task statistics`
  }

  present () {
    this.$main = $('#main')
    this.$main.html(renderTemplate('loading-view'))

    $
      .when(
        identityProvider.fetchIdentity(),
        contestProvider.fetchContest()
      )
      .done((identity, contest) => {
        if (identity.isSupervisor()) {
          if (dataStore.supportsRealtime()) {
            dataStore.connectRealtime()
          }

          identityProvider.subscribe()

          navigationBar.present()
          statusBar.present()

          this.$main.html(renderTemplate('task-statistics-view'))
        } else {
          this.$main.html(renderTemplate('access-forbidden-view', {
            urlPath: window.location.pathname
          }))
        }
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

export default new TaskStatisticsView()
