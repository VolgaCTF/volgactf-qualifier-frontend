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

  fetchTeamReviewStatistics (teamId) {
    let promise = $.Deferred()
    let url = `/api/team/${teamId}/review/statistics`

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
    this.teamTaskReviews = _.map(window.themis.quals.data.teamTaskReviews, function (options) {
      return new TeamTaskReviewModel(options)
    })
    promise.resolve(this.teamTaskReviews)
    return promise
  }

  fetchTeamReviews (teamId) {
    let promise = $.Deferred()
    let url = `/api/team/${teamId}/review/index`

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

    let realtimeProvider = dataStore.getRealtimeProvider()

    this.onCreateTeamTaskReview = (e) => {
      let options = JSON.parse(e.data)
      this.contest = new TeamTaskReviewModel(options)
      this.trigger('createTeamTaskReview', [this.contest, new Date(options.__metadataCreatedAt)])
    }

    realtimeProvider.addEventListener('createTeamTaskReview', this.onCreateTeamTaskReview)
  }

  unsubscribe () {
    if (!dataStore.supportsRealtime()) {
      return
    }

    let realtimeProvider = dataStore.getRealtimeProvider()

    if (this.onCreateTeamTaskReview) {
      realtimeProvider.removeEventListener('createTeamTaskReview', this.onCreateTeamTaskReview)
      this.onCreateTeamTaskReview = null
    }
  }
}

export default new TeamTaskReviewProvider()
