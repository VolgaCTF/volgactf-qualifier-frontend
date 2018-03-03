import $ from 'jquery'
import View from './base'
import dataStore from '../data-store'
import newNavigationBar from '../new-navigation-bar'
import newStatusBar from '../new-status-bar'
import contestProvider from '../providers/contest'
import identityProvider from '../providers/identity'

class AboutView extends View {
  constructor () {
    super()
    this.$main = null
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
          .done((contest) => {
            identityProvider.subscribe()

            newNavigationBar.present()
            newStatusBar.present()
          })
      })
  }
}

export default new AboutView()
