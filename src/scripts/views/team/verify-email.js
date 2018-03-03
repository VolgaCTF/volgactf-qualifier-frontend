import $ from 'jquery'
import View from '../base'
import newNavigationBar from '../../new-navigation-bar'
import identityProvider from '../../providers/identity'

class VerifyEmailView extends View {
  constructor () {
    super()
    this.$main = null
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
}

export default new VerifyEmailView()
