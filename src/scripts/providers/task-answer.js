import $ from 'jquery'
import _ from 'underscore'
import EventEmitter from 'wolfy87-eventemitter'
import TaskAnswerModel from '../models/task-answer'

class TaskAnswerProvider extends EventEmitter {
  fetchTaskAnswersByTask (taskId) {
    let promise = $.Deferred()
    let url = `/api/task/${taskId}/answer`

    $.ajax({
      url: url,
      dataType: 'json',
      success: (responseJSON, textStatus, jqXHR) => {
        let taskAnswers = _.map(responseJSON, (options) => {
          return new TaskAnswerModel(options)
        })

        promise.resolve(taskAnswers)
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

export default new TaskAnswerProvider()
