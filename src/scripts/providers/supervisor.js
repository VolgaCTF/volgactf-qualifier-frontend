import dataStore from '../data-store'
import EventEmitter from 'wolfy87-eventemitter'
import SupervisorModel from '../models/supervisor'

class SupervisorProvider extends EventEmitter {
  constructor () {
    super()

    this.onCreate = null
    this.onDelete = null
    this.onUpdatePassword = null

    this.onLogin = null
    this.onLogout = null
  }

  subscribe () {
    if (!dataStore.supportsRealtime()) {
      return
    }

    const realtimeProvider = dataStore.getRealtimeProvider()

    this.onCreate = (e) => {
      const options = JSON.parse(e.data)
      const supervisor = new SupervisorModel(options)
      this.trigger('createSupervisor', [supervisor, new Date(options.__metadataCreatedAt)])
    }

    realtimeProvider.addEventListener('createSupervisor', this.onCreate)

    this.onDelete = (e) => {
      const options = JSON.parse(e.data)
      const supervisor = new SupervisorModel(options)
      this.trigger('deleteSupervisor', [supervisor, new Date(options.__metadataCreatedAt)])
    }

    realtimeProvider.addEventListener('deleteSupervisor', this.onDelete)

    this.onUpdatePassword = (e) => {
      const options = JSON.parse(e.data)
      const supervisor = new SupervisorModel(options)
      this.trigger('updateSupervisorPassword', [supervisor, new Date(options.__metadataCreatedAt)])
    }

    realtimeProvider.addEventListener('updateSupervisorPassword', this.onUpdatePassword)

    this.onLogin = (e) => {
      const options = JSON.parse(e.data)
      const obj = {
        supervisor: new SupervisorModel(options.supervisor),
        geoIP: options.geoIP
      }
      this.trigger('loginSupervisor', [obj, new Date(options.__metadataCreatedAt)])
    }

    realtimeProvider.addEventListener('loginSupervisor', this.onLogin)

    this.onLogout = (e) => {
      const options = JSON.parse(e.data)
      const supervisor = new SupervisorModel(options)
      this.trigger('logoutSupervisor', [supervisor, new Date(options.__metadataCreatedAt)])
    }

    realtimeProvider.addEventListener('logoutSupervisor', this.onLogout)
  }
}

export default new SupervisorProvider()
