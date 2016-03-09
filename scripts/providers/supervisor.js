import dataStore from '../data-store'
import EventEmitter from 'wolfy87-eventemitter'
import SupervisorModel from '../models/supervisor'

class SupervisorProvider extends EventEmitter {
  constructor () {
    super()

    this.onCreate = null
    this.onDelete = null

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

  unsubscribe () {
    if (!dataStore.supportsRealtime()) {
      return
    }

    let realtimeProvider = dataStore.getRealtimeProvider()

    if (this.onCreate) {
      realtimeProvider.removeEventListener('createSupervisor', this.onCreate)
      this.onCreate = null
    }

    if (this.onDelete) {
      realtimeProvider.removeEventListener('deleteSupervisor', this.onDelete)
      this.onDelete = null
    }

    if (this.onLogin) {
      realtimeProvider.removeEventListener('loginSupervisor', this.onLogin)
      this.onLogin = null
    }

    if (this.onLogout) {
      realtimeProvider.removeEventListener('logoutSupervisor', this.onLogout)
      this.onLogout = null
    }
  }
}

export default new SupervisorProvider()
