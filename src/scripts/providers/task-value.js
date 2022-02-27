import $ from 'jquery'
import _ from 'underscore'
import dataStore from '../data-store'
import EventEmitter from 'wolfy87-eventemitter'
import TaskValueModel from '../models/task-value'

class TaskValueProvider extends EventEmitter {
  constructor () {
    super()
    this.taskValues = []

    this.onCreate = null
    this.onUpdate = null
    this.onReveal = null
  }

  getTaskValues () {
    return this.taskValues
  }

  subscribe (identity) {
    if (!dataStore.supportsRealtime()) {
      return
    }

    const realtimeProvider = dataStore.getRealtimeProvider()

    if (identity.isSupervisor()) {
      this.onCreate = (e) => {
        const options = JSON.parse(e.data)
        const taskValue = new TaskValueModel(options)
        this.taskValues.push(taskValue)
        this.trigger('createTaskValue', [taskValue, new Date(options.__metadataCreatedAt)])
      }
      realtimeProvider.addEventListener('createTaskValue', this.onCreate)
    }

    this.onUpdate = (e) => {
      const options = JSON.parse(e.data)
      const taskValue = new TaskValueModel(options)
      const ndx = _.findIndex(this.taskValues, { id: options.id })
      if (ndx > -1) {
        this.taskValues.splice(ndx, 1)
      }
      this.taskValues.push(taskValue)
      this.trigger('updateTaskValue', [taskValue, new Date(options.__metadataCreatedAt)])
    }
    realtimeProvider.addEventListener('updateTaskValue', this.onUpdate)

    if (identity.isTeam() || identity.isGuest()) {
      this.onReveal = (e) => {
        const options = JSON.parse(e.data)
        const taskValue = new TaskValueModel(options)
        this.taskValues.push(taskValue)
        this.trigger('revealTaskValue', [taskValue, new Date(options.__metadataCreatedAt)])
      }
      realtimeProvider.addEventListener('revealTaskValue', this.onReveal)
    }
  }

  initTaskValues () {
    const promise = $.Deferred()
    this.taskValues = _.map(window.volgactf.qualifier.data.taskValues, function (options) {
      return new TaskValueModel(options)
    })
    promise.resolve(this.taskValues)
    return promise
  }
}

export default new TaskValueProvider()
