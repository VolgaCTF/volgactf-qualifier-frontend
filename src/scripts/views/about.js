import $ from 'jquery'
import View from './base'
import navigationBar from '../new-navigation-bar'
import statusBar from '../new-status-bar'
import contestProvider from '../providers/contest'
import identityProvider from '../providers/identity'

class AboutView extends View {
  present () {
    $
    .when(
      identityProvider.initIdentity(),
      contestProvider.initContest()
    )
    .done((identity, contest) => {
      identityProvider.subscribe()
      navigationBar.present()
      statusBar.present()
    })
  }
}

export default new AboutView()
