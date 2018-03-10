import $ from 'jquery'
import View from './base'
import navigationBar from '../new-navigation-bar'
import statusBar from '../new-status-bar'
import contestProvider from '../providers/contest'
import identityProvider from '../providers/identity'

class IndexView extends View {
  constructor () {
    super()
    this.$main = null
    this.onUpdateContest = null
  }

  present () {
    this.$main = $('#main')

    $
    .when(
      identityProvider.initIdentity(),
      contestProvider.initContest()
    )
    .done((identity, contest) => {
      identityProvider.subscribe()

      navigationBar.present()
      statusBar.present()

      this.onUpdateContest = (e) => {
        this.render()
        return false
      }

      contestProvider.on('updateContest', this.onUpdateContest)
    })
  }
}

export default new IndexView()
