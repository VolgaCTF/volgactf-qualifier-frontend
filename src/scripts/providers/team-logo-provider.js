import $ from 'jquery'
import _ from 'underscore'
import EventEmitter from 'wolfy87-eventemitter'
import TeamModel from '../models/team'
import identityProvider from './identity'
import dataStore from '../data-store'

class TeamLogoProvider extends EventEmitter {
  constructor () {
    super()
    this.onUpdateLogo = null
  }

  subscribe () {
    if (!dataStore.supportsRealtime()) {
      return
    }

    let realtimeProvider = dataStore.getRealtimeProvider()

    this.onUpdateLogo = (e) => {
      let options = JSON.parse(e.data)
      let team = new TeamModel(options)
      this.trigger('updateTeamLogo', [team, new Date(options.__metadataCreatedAt)])
    }

    realtimeProvider.addEventListener('updateTeamLogo', this.onUpdateLogo)
  }
}

export default new TeamLogoProvider()
