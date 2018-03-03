import $ from 'jquery'
import View from './base'
import identityProvider from '../providers/identity'
import newNavigationBar from '../new-navigation-bar'

class DefaultView extends View {
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

export default new DefaultView()
