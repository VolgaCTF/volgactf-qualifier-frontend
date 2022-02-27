import EventEmitter from 'wolfy87-eventemitter'
import TeamModel from '../models/team'
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

    const realtimeProvider = dataStore.getRealtimeProvider()

    this.onUpdateLogo = (e) => {
      const options = JSON.parse(e.data)
      const team = new TeamModel(options)
      this.trigger('updateTeamLogo', [team, new Date(options.__metadataCreatedAt)])
    }

    realtimeProvider.addEventListener('updateTeamLogo', this.onUpdateLogo)
  }
}

export default new TeamLogoProvider()
