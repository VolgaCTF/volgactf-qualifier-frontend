import $ from 'jquery'
import _ from 'underscore'
import EventEmitter from 'wolfy87-eventemitter'
import TeamTaskReviewModel from '../models/team-task-review'

class TeamTaskReviewProvider extends EventEmitter {
  fetchTeamTaskReviewsByTask (taskId) {
    let promise = $.Deferred()
    let url = `/api/task/${taskId}/review/index`

    $.ajax({
      url: url,
      dataType: 'json',
      success: (responseJSON, textStatus, jqXHR) => {
        let teamTaskReviews = _.map(responseJSON, (options) => {
          return new TeamTaskReviewModel(options)
        })

        promise.resolve(teamTaskReviews)
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

  fetchTaskReviewStatistics (taskId) {
    let promise = $.Deferred()
    let url = `/api/task/${taskId}/review/statistics`

    $.ajax({
      url: url,
      dataType: 'json',
      success: (responseJSON, textStatus, jqXHR) => {
        promise.resolve(responseJSON)
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

export default new TeamTaskReviewProvider()
