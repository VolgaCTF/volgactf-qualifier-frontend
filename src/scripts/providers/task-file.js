import $ from 'jquery'
import _ from 'underscore'
import EventEmitter from 'wolfy87-eventemitter'
import TaskFileModel from '../models/task-file'

class TaskFileProvider extends EventEmitter {
  fetchTaskFilesByTask (taskId) {
    let promise = $.Deferred()
    let url = `/api/task/${taskId}/file/index`

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
    let promise = $.Deferred()
    let url = `/api/task/${taskId}/file/${taskFileId}/delete`

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

export default new TaskFileProvider()
