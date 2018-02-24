import $ from 'jquery'
import View from '../base'
import newNavigationBar from '../../new-navigation-bar'
import metadataStore from '../../utils/metadata-store'
import identityProvider from '../../providers/identity'

class VerifyEmailView extends View {
  constructor () {
    super(/^\/team\/verify-email$/)
    this.$main = null
  }

  getTitle () {
    return `${metadataStore.getMetadata('event-title')} :: Email verification`
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
    navigationBar.dismiss()
  }
}

export default new VerifyEmailView()
