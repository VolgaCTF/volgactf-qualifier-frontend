import $ from 'jquery'
import _ from 'underscore'
import EventEmitter from 'wolfy87-eventemitter'
import dataStore from '../data-store'
import TaskPreviewModel from '../models/task-preview'
import TaskModel from '../models/task'
import identityProvider from './identity'

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

    if (identityProvider.getIdentity().isSupervisor()) {
      this.onCreateTask = (e) => {
        let options = JSON.parse(e.data)
        let taskPreview = new TaskPreviewModel(options)
        this.taskPreviews.push(taskPreview)
        this.trigger('createTask', [taskPreview, new Date(options.__metadataCreatedAt)])
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
      this.trigger('openTask', [taskPreview, new Date(options.__metadataCreatedAt)])
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
      this.trigger('closeTask', [taskPreview, new Date(options.__metadataCreatedAt)])
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
      this.trigger('updateTask', [taskPreview, new Date(options.__metadataCreatedAt)])
    }

    realtimeProvider.addEventListener('updateTask', this.onUpdateTask)
  }

  initTaskPreviews () {
    const promise = $.Deferred()
    this.taskPreviews = _.map(window.volgactf.qualifier.data.taskPreviews, function (options) {
      return new TaskPreviewModel(options)
    })
    promise.resolve(this.taskPreviews)
    return promise
  }

  fetchTaskPreviews () {
    let promise = $.Deferred()
    let url = '/api/task/index'

    $.ajax({
      url: url,
      dataType: 'json',
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

  fetchTask (taskId) {
    let promise = $.Deferred()
    let url = `/api/task/${taskId}`

    $.ajax({
      url: url,
      dataType: 'json',
      success: (responseJSON, textStatus, jqXHR) => {
        promise.resolve(new TaskModel(responseJSON))
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
