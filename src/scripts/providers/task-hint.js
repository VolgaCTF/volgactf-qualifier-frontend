import $ from 'jquery'
import _ from 'underscore'
import EventEmitter from 'wolfy87-eventemitter'
import TaskHintModel from '../models/task-hint'

class TaskHintProvider extends EventEmitter {
  fetchTaskHintsByTask (taskId) {
    let promise = $.Deferred()
    let url = `/api/task/${taskId}/hint`

    $.ajax({
      url: url,
      dataType: 'json',
      success: (responseJSON, textStatus, jqXHR) => {
        let taskHints = _.map(responseJSON, (options) => {
          return new TaskHintModel(options)
        })

        promise.resolve(taskHints)
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

export default new TaskHintProvider()
