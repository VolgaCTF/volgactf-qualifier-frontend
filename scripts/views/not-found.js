import $ from 'jquery'
import View from './base'
import renderTemplate from '../utils/render-template'
import metadataStore from '../utils/metadata-store'
import identityProvider from '../providers/identity'
import navigationBar from '../navigation-bar'

class NotFoundView extends View {
  constructor () {
    super(null)
    this.$main = null
  }

  getTitle () {
    return `${metadataStore.getMetadata('event-title')} :: Not Found`
  }

  present () {
    this.$main = $('#main')

    $
      .when(identityProvider.fetchIdentity())
      .done((identity) => {
        identityProvider.subscribe()
        navigationBar.present()
        this.$main.html(renderTemplate('not-found-view', {
          urlPath: window.location.pathname
        }))
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
    this.$main = null
    navigationBar.dismiss()
  }
}

export default new NotFoundView()
