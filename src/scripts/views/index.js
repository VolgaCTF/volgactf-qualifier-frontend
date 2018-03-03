import $ from 'jquery'
import View from './base'
import newNavigationBar from '../new-navigation-bar'
import newStatusBar from '../new-status-bar'
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

            newNavigationBar.present()
            newStatusBar.present()

            this.onUpdateContest = (e) => {
              this.render()
              return false
            }

            contestProvider.on('updateContest', this.onUpdateContest)
          })
      })
  }
}

export default new IndexView()
