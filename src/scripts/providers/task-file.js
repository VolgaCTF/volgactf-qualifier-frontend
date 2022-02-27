import $ from 'jquery'
import _ from 'underscore'
import EventEmitter from 'wolfy87-eventemitter'
import TaskFileModel from '../models/task-file'
import dataStore from '../data-store'
import identityProvider from './identity'

class TaskFileProvider extends EventEmitter {
  constructor () {
    super()
    this.onCreate = null
    this.onDelete = null
  }

  fetchTaskFilesByTask (taskId) {
    const promise = $.Deferred()
    const url = `/api/task/${taskId}/file/index`

    $.ajax({
      url: url,
      dataType: 'json',
      success: (responseJSON, textStatus, jqXHR) => {
        const taskFiles = _.map(responseJSON, (options) => {
          return new TaskFileModel(options)
        })

        promise.resolve(taskFiles)
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

  deleteTaskFile (taskId, taskFileId, token) {
    const promise = $.Deferred()
    const url = `/api/task/${taskId}/file/${taskFileId}/delete`

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

  subscribe () {
    if (!dataStore.supportsRealtime()) {
      return
    }

    const realtimeProvider = dataStore.getRealtimeProvider()
    const identity = identityProvider.getIdentity()

    if (identity.isSupervisor()) {
      this.onCreate = (e) => {
        const options = JSON.parse(e.data)
        const taskFile = new TaskFileModel(options)
        this.trigger('createTaskFile', [taskFile, new Date(options.__metadataCreatedAt)])
      }
      realtimeProvider.addEventListener('createTaskFile', this.onCreate)

      this.onDelete = (e) => {
        const options = JSON.parse(e.data)
        const taskFile = new TaskFileModel(options)
        this.trigger('deleteTaskFile', [taskFile, new Date(options.__metadataCreatedAt)])
      }
      realtimeProvider.addEventListener('deleteTaskFile', this.onDelete)
    }
  }
}

export default new TaskFileProvider()
