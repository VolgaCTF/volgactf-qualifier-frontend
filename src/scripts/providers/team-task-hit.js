import $ from 'jquery'
import _ from 'underscore'
import EventEmitter from 'wolfy87-eventemitter'
import dataStore from '../data-store'
import TeamTaskHitModel from '../models/team-task-hit'
import TeamTaskHitAttemptModel from '../models/team-task-hit-attempt'
import identityProvider from './identity'

class TeamTaskHitProvider extends EventEmitter {
  constructor () {
    super()

    this.teamTaskHits = []

    this.onCreateTeamTaskHit = null
    this.onCreateTeamTaskHitAttempt = null
  }

  getTeamTaskHits () {
    return this.teamTaskHits
  }

  subscribe () {
    if (!dataStore.supportsRealtime()) {
      return
    }

    const realtimeProvider = dataStore.getRealtimeProvider()
    const identity = identityProvider.getIdentity()

    if (identity.isSupervisor()) {
      this.onCreateTeamTaskHitAttempt = (e) => {
        const options = JSON.parse(e.data)
        const teamTaskHitAttempt = new TeamTaskHitAttemptModel(options)
        this.trigger('createTeamTaskHitAttempt', [teamTaskHitAttempt, new Date(options.__metadataCreatedAt)])
      }

      realtimeProvider.addEventListener('createTeamTaskHitAttempt', this.onCreateTeamTaskHitAttempt)
    }

    if (identity.isSupervisor() || identity.isTeam()) {
      this.onCreateTeamTaskHit = (e) => {
        const options = JSON.parse(e.data)
        const teamTaskHit = new TeamTaskHitModel(options)
        const ndx = _.findIndex(this.teamTaskHits, { teamId: options.teamId, taskId: options.taskId })
        if (ndx === -1) {
          if (identity.isTeam() && !identity.isExactTeam(options.teamId)) {
            return
          }
          this.teamTaskHits.push(teamTaskHit)
          this.trigger('createTeamTaskHit', [teamTaskHit, new Date(options.__metadataCreatedAt)])
        }
      }

      realtimeProvider.addEventListener('createTeamTaskHit', this.onCreateTeamTaskHit)
    }
  }

  fetchTaskHitStatistics (taskId) {
    const promise = $.Deferred()
    const url = `/api/task/${taskId}/hit/statistics`

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

  fetchTeamHitStatistics (teamId) {
    const promise = $.Deferred()
    const url = `/api/team/${teamId}/hit/statistics`

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

  fetchTaskHits (taskId) {
    const promise = $.Deferred()
    const url = `/api/task/${taskId}/hit/index`

    $.ajax({
      url: url,
      dataType: 'json',
      success: (responseJSON, textStatus, jqXHR) => {
        this.teamTaskHits = _.map(responseJSON, (options) => {
          return new TeamTaskHitModel(options)
        })
        promise.resolve(this.teamTaskHits)
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

  initTeamTaskHits () {
    const promise = $.Deferred()
    this.teamTaskHits = _.map(window.volgactf.qualifier.data.teamTaskHits, function (options) {
      return new TeamTaskHitModel(options)
    })
    promise.resolve(this.teamTaskHits)
    return promise
  }

  fetchTeamHits (teamId) {
    const promise = $.Deferred()
    const url = `/api/team/${teamId}/hit/index`

    $.ajax({
      url: url,
      dataType: 'json',
      success: (responseJSON, textStatus, jqXHR) => {
        this.teamTaskHits = _.map(responseJSON, (options) => {
          return new TeamTaskHitModel(options)
        })

        promise.resolve(this.teamTaskHits)
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

export default new TeamTaskHitProvider()
