import $ from 'jquery'
import View from './base'
import metadataStore from '../utils/metadata-store'
import identityProvider from '../providers/identity'
import newNavigationBar from '../new-navigation-bar'

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
      .when(identityProvider.initIdentity())
      .done((identity) => {
        identityProvider.subscribe()
        newNavigationBar.present()
      })
  }

  dismiss () {
    identityProvider.unsubscribe()
    this.$main.empty()
    this.$main = null
    newNavigationBar.dismiss()
  }
}

export default new NotFoundView()
