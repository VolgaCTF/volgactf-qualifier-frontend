import $ from 'jquery'
import _ from 'underscore'
import EventEmitter from 'wolfy87-eventemitter'
import dataStore from '../data-store'
import TaskPreviewModel from '../models/task-preview'
import TaskModel from '../models/task'
import identityProvider from './identity'
import TaskFullModel from '../models/task-full'

class TaskProvider extends EventEmitter {
  constructor () {
    super()
    this.taskPreviews = []

    this.onCreateTask = null
    this.onOpenTask = null
    this.onCloseTask = null
    this.onUpdateTask = null
  }

  getTaskPreviews () {
    return this.taskPreviews
  }

  subscribe () {
    if (!dataStore.supportsRealtime()) {
      return
    }

    let realtimeProvider = dataStore.getRealtimeProvider()

    let isSupervisor = _.contains(['admin', 'manager'], identityProvider.getIdentity().role)
    if (isSupervisor) {
      this.onCreateTask = (e) => {
        let options = JSON.parse(e.data)
        let taskPreview = new TaskPreviewModel(options)
        this.taskPreviews.push(taskPreview)
        this.trigger('createTask', [taskPreview])
      }

      realtimeProvider.addEventListener('createTask', this.onCreateTask)
    }

    this.onOpenTask = (e) => {
      let options = JSON.parse(e.data)
      let taskPreview = new TaskPreviewModel(options)
      let ndx = _.findIndex(this.taskPreviews, { id: options.id })
      if (ndx > -1) {
        this.taskPreviews.splice(ndx, 1)
      }
      this.taskPreviews.push(taskPreview)
      this.trigger('openTask', [taskPreview])
    }

    realtimeProvider.addEventListener('openTask', this.onOpenTask)

    this.onCloseTask = (e) => {
      let options = JSON.parse(e.data)
      let taskPreview = new TaskPreviewModel(options)
      let ndx = _.findIndex(this.taskPreviews, { id: options.id })
      if (ndx > -1) {
        this.taskPreviews.splice(ndx, 1)
      }
      this.taskPreviews.push(taskPreview)
      this.trigger('closeTask', [taskPreview])
    }

    realtimeProvider.addEventListener('closeTask', this.onCloseTask)

    this.onUpdateTask = (e) => {
      let options = JSON.parse(e.data)
      let taskPreview = new TaskPreviewModel(options)
      let ndx = _.findIndex(this.taskPreviews, { id: options.id })
      if (ndx > -1) {
        this.taskPreviews.splice(ndx, 1)
      }
      this.taskPreviews.push(taskPreview)
      this.trigger('updateTask', [taskPreview])
    }

    realtimeProvider.addEventListener('updateTask', this.onUpdateTask)
  }

  unsubscribe () {
    if (!dataStore.supportsRealtime()) {
      return
    }

    let realtimeProvider = dataStore.getRealtimeProvider()

    if (this.onCreateTask) {
      realtimeProvider.removeEventListener('createTask', this.onCreate)
      this.onCreateTask = null
    }

    if (this.onOpenTask) {
      realtimeProvider.removeEventListener('openTask', this.onOpen)
      this.onOpenTask = null
    }

    if (this.onCloseTask) {
      realtimeProvider.removeEventListener('closeTask', this.onClose)
      this.onCloseTask = null
    }

    if (this.onUpdateTask) {
      realtimeProvider.removeEventListener('updateTask', this.onUpdate)
      this.onUpdateTask = null
    }

    this.taskPreviews = []
  }

  fetchTaskPreviews () {
    let promise = $.Deferred()
    let url = '/api/task/all'

    $.ajax({
      url: url,
      dataType: 'json',
      xhrFields: {
        withCredentials: true
      },
      success: (responseJSON, textStatus, jqXHR) => {
        this.taskPreviews = _.map(responseJSON, (options) => {
          return new TaskPreviewModel(options)
        })

        promise.resolve(this.taskPreviews)
      },
      error: (jqXHR, textStatus, errorThrown) => {
        if (jqXHR.responseJSON) {
          promise.reject(jqXHR.responseJSON)
        } else {
          promise.reject('Unknown error. Please try again later.')
        }
      }
    })

    return promise
  }

  fetchTask (taskId, options = {}) {
    let defaultOptions = {
      full: false
    }
    options = _.extend(defaultOptions, options)
    let promise = $.Deferred()
    let url = null

    if (options.full) {
      url = `/api/task/${taskId}/full`
    } else {
      url = `/api/task/${taskId}`
    }

    $.ajax({
      url: url,
      dataType: 'json',
      xhrFields: {
        withCredentials: true
      },
      success: (responseJSON, textStatus, jqXHR) => {
        let res = null
        if (options.full) {
          res = new TaskFullModel(responseJSON)
        } else {
          res = new TaskModel(responseJSON)
        }

        promise.resolve(res)
      },
      error: (jqXHR, textStatus, errorThrown) => {
        if (jqXHR.responseJSON) {
          promise.reject(jqXHR.responseJSON)
        } else {
          promise.reject('Unknown error. Please try again later.')
        }
      }
    })

    return promise
  }

  openTask (id, token) {
    let promise = $.Deferred()
    let url = `/api/task/${id}/open`

    $.ajax({
      url: url,
      type: 'POST',
      dataType: 'json',
      data: {},
      xhrFields: {
        withCredentials: true
      },
      headers: {
        'X-CSRF-Token': token
      },
      success: (responseJSON, textStatus, jqXHR) => {
        promise.resolve()
      },
      error: (jqXHR, textStatus, errorThrown) => {
        if (jqXHR.responseJSON) {
          promise.reject(jqXHR.responseJSON)
        } else {
          promise.reject('Unknown error. Please try again later.')
        }
      }
    })

    return promise
  }

  closeTask (id, token) {
    let promise = $.Deferred()
    let url = `/api/task/${id}/close`

    $.ajax({
      url: url,
      type: 'POST',
      dataType: 'json',
      data: {},
      xhrFields: {
        withCredentials: true
      },
      headers: {
        'X-CSRF-Token': token
      },
      success: (responseJSON, textStatus, jqXHR) => {
        promise.resolve()
      },
      error: (jqXHR, textStatus, errorThrown) => {
        if (jqXHR.responseJSON) {
          promise.reject(jqXHR.responseJSON)
        } else {
          promise.reject('Unknown error. Please try again later.')
        }
      }
    })

    return promise
  }
}

export default new TaskProvider()
