import $ from 'jquery'
import _ from 'underscore'
import dataStore from '../data-store'
import EventEmitter from 'wolfy87-eventemitter'
import TaskRemoteCheckerModel from '../models/task-remote-checker'

class TaskRemoteCheckerProvider extends EventEmitter {
  constructor () {
    super()
    this.taskRemoteCheckers = []

    this.onCreate = null
  }

  getTaskRemoteCheckers () {
    return this.taskRemoteCheckers
  }

  subscribe () {
    if (!dataStore.supportsRealtime()) {
      return
    }

    const realtimeProvider = dataStore.getRealtimeProvider()

    this.onCreate = (e) => {
      const options = JSON.parse(e.data)
      const taskRemoteChecker = new TaskRemoteCheckerModel(options)
      this.taskRemoteCheckers.push(taskRemoteChecker)
      this.trigger('createTaskRemoteChecker', [taskRemoteChecker, new Date(options.__metadataCreatedAt)])
    }

    realtimeProvider.addEventListener('createTaskRemoteChecker', this.onCreate)
  }

  initTaskRemoteCheckers () {
    const promise = $.Deferred()
    this.taskRemoteCheckers = _.map(window.volgactf.qualifier.data.taskRemoteCheckers, function (options) {
      return new TaskRemoteCheckerModel(options)
    })
    promise.resolve(this.taskRemoteCheckers)
    return promise
  }
}

export default new TaskRemoteCheckerProvider()
