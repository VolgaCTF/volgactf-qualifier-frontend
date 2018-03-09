import $ from 'jquery'
import View from '../base'
import newNavigationBar from '../../new-navigation-bar'
import newStatusBar from '../../new-status-bar'
import contestProvider from '../../providers/contest'
import identityProvider from '../../providers/identity'

class TaskStatisticsView extends View {
  present () {
    $
    .when(
      identityProvider.initIdentity(),
      contestProvider.initContest()
    )
    .done((identity, contest) => {
      identityProvider.subscribe()

      newNavigationBar.present()
      newStatusBar.present()
    })
  }
}

export default new TaskStatisticsView()
