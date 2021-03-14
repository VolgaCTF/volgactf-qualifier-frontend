import $ from 'jquery'
import EventEmitter from 'wolfy87-eventemitter'
import TeamModel from '../models/team'
import identityProvider from './identity'
import dataStore from '../data-store'

class IdentityLogoProvider extends EventEmitter {
  constructor () {
    super()
    this.onUpdateLogo = null
  }

  subscribe () {
    if (!dataStore.supportsRealtime()) {
      return
    }

    let realtimeProvider = dataStore.getRealtimeProvider()
    let identity = identityProvider.getIdentity()

    if (identity.isTeam()) {
      this.onUpdateLogo = (e) => {
        const options = JSON.parse(e.data)
        const team = new TeamModel(options)
        if (team.id === identity.id) {
          this.trigger('updateTeamLogo', [team, new Date(options.__metadataCreatedAt)])
        }
      }

      realtimeProvider.addEventListener('updateTeamLogo', this.onUpdateLogo)
    }
  }
}

export default new IdentityLogoProvider()
