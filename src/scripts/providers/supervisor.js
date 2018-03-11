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

    let realtimeProvider = dataStore.getRealtimeProvider()

    this.onCreate = (e) => {
      let options = JSON.parse(e.data)
      let supervisor = new SupervisorModel(options)
      this.trigger('createSupervisor', [supervisor, new Date(options.__metadataCreatedAt)])
    }

    realtimeProvider.addEventListener('createSupervisor', this.onCreate)

    this.onDelete = (e) => {
      let options = JSON.parse(e.data)
      let supervisor = new SupervisorModel(options)
      this.trigger('deleteSupervisor', [supervisor, new Date(options.__metadataCreatedAt)])
    }

    realtimeProvider.addEventListener('deleteSupervisor', this.onDelete)

    this.onUpdatePassword = (e) => {
      let options = JSON.parse(e.data)
      let supervisor = new SupervisorModel(options)
      this.trigger('updateSupervisorPassword', [supervisor, new Date(options.__metadataCreatedAt)])
    }

    realtimeProvider.addEventListener('updateSupervisorPassword', this.onUpdatePassword)

    this.onLogin = (e) => {
      let options = JSON.parse(e.data)
      let supervisor = new SupervisorModel(options)
      this.trigger('loginSupervisor', [supervisor, new Date(options.__metadataCreatedAt)])
    }

    realtimeProvider.addEventListener('loginSupervisor', this.onLogin)

    this.onLogout = (e) => {
      let options = JSON.parse(e.data)
      let supervisor = new SupervisorModel(options)
      this.trigger('logoutSupervisor', [supervisor, new Date(options.__metadataCreatedAt)])
    }

    realtimeProvider.addEventListener('logoutSupervisor', this.onLogout)
  }
}

export default new SupervisorProvider()
