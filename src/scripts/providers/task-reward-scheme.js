import $ from 'jquery'
import _ from 'underscore'
import dataStore from '../data-store'
import EventEmitter from 'wolfy87-eventemitter'
import TaskRewardSchemeModel from '../models/task-reward-scheme'

class TaskRewardSchemeProvider extends EventEmitter {
  constructor () {
    super()
    this.taskRewardSchemes = []

    this.onCreate = null
    this.onUpdate = null
    this.onReveal = null
  }

  getTaskRewardSchemes () {
    return this.taskRewardSchemes
  }

  subscribe (identity) {
    if (!dataStore.supportsRealtime()) {
      return
    }

    const realtimeProvider = dataStore.getRealtimeProvider()

    if (identity.isSupervisor()) {
      this.onCreate = (e) => {
        const options = JSON.parse(e.data)
        const taskRewardScheme = new TaskRewardSchemeModel(options)
        this.taskRewardSchemes.push(taskRewardScheme)
        this.trigger('createTaskRewardScheme', [taskRewardScheme, new Date(options.__metadataCreatedAt)])
      }
      realtimeProvider.addEventListener('createTaskRewardScheme', this.onCreate)
    }

    this.onUpdate = (e) => {
      const options = JSON.parse(e.data)
      const taskRewardScheme = new TaskRewardSchemeModel(options)
      const ndx = _.findIndex(this.taskRewardSchemes, { id: options.id })
      if (ndx > -1) {
        this.taskRewardSchemes.splice(ndx, 1)
      }
      this.taskRewardSchemes.push(taskRewardScheme)
      this.trigger('updateTaskRewardScheme', [taskRewardScheme, new Date(options.__metadataCreatedAt)])
    }
    realtimeProvider.addEventListener('updateTaskRewardScheme', this.onUpdate)

    if (identity.isTeam() || identity.isGuest()) {
      this.onReveal = (e) => {
        const options = JSON.parse(e.data)
        const taskRewardScheme = new TaskRewardSchemeModel(options)
        this.taskRewardSchemes.push(taskRewardScheme)
        this.trigger('revealTaskRewardScheme', [taskRewardScheme, new Date(options.__metadataCreatedAt)])
      }
      realtimeProvider.addEventListener('revealTaskRewardScheme', this.onReveal)
    }
  }

  initTaskRewardSchemes () {
    const promise = $.Deferred()
    this.taskRewardSchemes = _.map(window.volgactf.qualifier.data.taskRewardSchemes, function (options) {
      return new TaskRewardSchemeModel(options)
    })
    promise.resolve(this.taskRewardSchemes)
    return promise
  }
}

export default new TaskRewardSchemeProvider()
