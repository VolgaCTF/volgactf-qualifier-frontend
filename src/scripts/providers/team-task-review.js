import $ from 'jquery'
import _ from 'underscore'
import EventEmitter from 'wolfy87-eventemitter'
import TeamTaskReviewModel from '../models/team-task-review'
import dataStore from '../data-store'

class TeamTaskReviewProvider extends EventEmitter {
  constructor () {
    super()
    this.onCreateTeamTaskReview = null
  }

  fetchTeamTaskReviewsByTask (taskId) {
    const promise = $.Deferred()
    const url = `/api/task/${taskId}/review/index`

    $.ajax({
      url: url,
      dataType: 'json',
      success: (responseJSON, textStatus, jqXHR) => {
        const teamTaskReviews = _.map(responseJSON, (options) => {
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
    const promise = $.Deferred()
    const url = `/api/task/${taskId}/review/statistics`

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

  fetchTeamReviewStatistics (teamId) {
    const promise = $.Deferred()
    const url = `/api/team/${teamId}/review/statistics`

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

  initTeamTaskReviews () {
    const promise = $.Deferred()
    this.teamTaskReviews = _.map(window.volgactf.qualifier.data.teamTaskReviews, function (options) {
      return new TeamTaskReviewModel(options)
    })
    promise.resolve(this.teamTaskReviews)
    return promise
  }

  fetchTeamReviews (teamId) {
    const promise = $.Deferred()
    const url = `/api/team/${teamId}/review/index`

    $.ajax({
      url: url,
      dataType: 'json',
      success: (responseJSON, textStatus, jqXHR) => {
        this.teamTaskReviews = _.map(responseJSON, (options) => {
          return new TeamTaskReviewModel(options)
        })

        promise.resolve(this.teamTaskReviews)
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

    this.onCreateTeamTaskReview = (e) => {
      const options = JSON.parse(e.data)
      this.contest = new TeamTaskReviewModel(options)
      this.trigger('createTeamTaskReview', [this.contest, new Date(options.__metadataCreatedAt)])
    }

    realtimeProvider.addEventListener('createTeamTaskReview', this.onCreateTeamTaskReview)
  }
}

export default new TeamTaskReviewProvider()
