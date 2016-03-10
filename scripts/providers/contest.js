import $ from 'jquery'
import _ from 'underscore'
import EventEmitter from 'wolfy87-eventemitter'
import dataStore from '../data-store'
import ContestModel from '../models/contest'
import TeamModel from '../models/team'
import TeamScoreModel from '../models/team-score'
import TeamTaskHitModel from '../models/team-task-hit'
import TeamTaskHitAttemptModel from '../models/team-task-hit-attempt'
import identityProvider from './identity'

class ContestProvider extends EventEmitter {
  constructor () {
    super()
    this.contest = null
    this.teamScores = []
    this.teamTaskHits = []

    this.onUpdate = null
    this.onUpdateTeamScore = null
    this.onQualifyTeam = null

    this.onCreateTeamTaskHit = null
    this.onCreateTeamTaskHitAttempt = null
  }

  getContest () {
    return this.contest
  }

  getTeamScores () {
    return this.teamScores
  }

  teamRankFunc (a, b) {
    if (a.score > b.score) {
      return -1
    } else if (a.score < b.score) {
      return 1
    } else {
      if (a.updatedAt && b.updatedAt) {
        if (a.updatedAt.getTime() < b.updatedAt.getTime()) {
          return -1
        } else if (a.updatedAt.getTime() > b.updatedAt.getTime()) {
          return 1
        } else {
          return 0
        }
      } else if (a.updatedAt && !b.updatedAt) {
        return -1
      } else if (!a.updatedAt && b.updatedAt) {
        return 1
      } else {
        return 0
      }
    }
  }

  getTeamTaskHits () {
    return this.teamTaskHits
  }

  subscribe () {
    if (!dataStore.supportsRealtime()) {
      return
    }

    let realtimeProvider = dataStore.getRealtimeProvider()

    this.onUpdate = (e) => {
      let options = JSON.parse(e.data)
      this.contest = new ContestModel(options)
      this.trigger('updateContest', [this.contest, new Date(options.__metadataCreatedAt)])
    }

    realtimeProvider.addEventListener('updateContest', this.onUpdate)

    this.onUpdateTeamScore = (e) => {
      let options = JSON.parse(e.data)
      let teamScore = new TeamScoreModel(options)
      let ndx = _.findIndex(this.teamScores, { teamId: options.teamId })
      if (ndx > -1) {
        this.teamScores.splice(ndx, 1)
      }
      this.teamScores.push(teamScore)
      this.trigger('updateTeamScore', [teamScore, new Date(options.__metadataCreatedAt)])
    }

    realtimeProvider.addEventListener('updateTeamScore', this.onUpdateTeamScore)

    this.onQualifyTeam = (e) => {
      let options = JSON.parse(e.data)
      let team = new TeamModel(options)
      let ndx = _.findIndex(this.teamScores, { teamId: team.id })
      if (ndx === -1) {
        let teamScore = new TeamScoreModel({
          teamId: team.id,
          score: 0,
          updatedAt: null
        })
        this.teamScores.push(teamScore)
        this.trigger('updateTeamScore', [teamScore, new Date(options.__metadataCreatedAt)])
      }
    }

    realtimeProvider.addEventListener('qualifyTeam', this.onQualifyTeam)

    let identity = identityProvider.getIdentity()
    if (identity.isSupervisor() || identity.isTeam()) {
      this.onCreateTeamTaskHit = (e) => {
        let options = JSON.parse(e.data)
        let teamTaskHit = new TeamTaskHitModel(options)
        let ndx = _.findIndex(this.teamTaskHits, { teamId: options.teamId, taskId: options.taskId })
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

    if (identity.isSupervisor()) {
      this.onCreateTeamTaskHitAttempt = (e) => {
        let options = JSON.parse(e.data)
        let teamTaskHitAttempt = new TeamTaskHitAttemptModel(options)
        this.trigger('createTeamTaskHitAttempt', [teamTaskHitAttempt, new Date(options.__metadataCreatedAt)])
      }

      realtimeProvider.addEventListener('createTeamTaskHitAttempt', this.onCreateTeamTaskHitAttempt)
    }
  }

  unsubscribe () {
    if (!dataStore.supportsRealtime()) {
      return
    }

    let realtimeProvider = dataStore.getRealtimeProvider()

    if (this.onUpdate) {
      realtimeProvider.removeEventListener('updateContest', this.onUpdate)
      this.onUpdate = null
    }

    if (this.onUpdateTeamScore) {
      realtimeProvider.removeEventListener('updateTeamScore', this.onUpdateTeamScore)
      this.onUpdateTeamScore = null
    }

    if (this.onQualifyTeam) {
      realtimeProvider.removeEventListener('qualifyTeam', this.onQualifyTeam)
      this.onQualifyTeam = null
    }

    if (this.onCreateTeamTaskHit) {
      realtimeProvider.removeEventListener('createTeamTaskHit', this.onCreateTeamTaskHit)
      this.onCreateTeamTaskHit = null
    }

    if (this.onCreateTeamTaskHitAttempt) {
      realtimeProvider.removeEventListener('createTeamTaskHitAttempt', this.onCreateTeamTaskHitAttempt)
      this.onCreateTeamTaskHitAttempt = null
    }

    this.contest = null
    this.teamScores = []
    this.teamTaskHits = []
  }

  fetchContest () {
    let promise = $.Deferred()
    let url = '/api/contest'

    $.ajax({
      url: url,
      dataType: 'json',
      success: (responseJSON, textStatus, jqXHR) => {
        this.contest = new ContestModel(responseJSON)
        promise.resolve(this.contest)
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

  fetchTeamScores () {
    let promise = $.Deferred()
    let url = '/api/team/score/index'

    $.ajax({
      url: url,
      dataType: 'json',
      success: (responseJSON, textStatus, jqXHR) => {
        this.teamScores = _.map(responseJSON, (options) => {
          return new TeamScoreModel(options)
        })

        promise.resolve(this.teamScores)
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

  fetchSolvedTeamCountByTask (taskId) {
    let promise = $.Deferred()
    let url = `/api/task/${taskId}/hits`

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

  fetchTeamTaskHit (teamId) {
    let promise = $.Deferred()

    let identity = identityProvider.getIdentity()
    let url = `/api/team/${teamId}/hits`

    $.ajax({
      url: url,
      dataType: 'json',
      success: (responseJSON, textStatus, jqXHR) => {
        if (identity.isSupervisor() || identity.isExactTeam(teamId)) {
          let teamTaskHits = _.map(responseJSON, (options) => {
            return new TeamTaskHitModel(options)
          })

          promise.resolve(teamTaskHits)
        } else {
          promise.resolve(responseJSON)
        }
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

  fetchTeamTaskHits () {
    let promise = $.Deferred()
    let identity = identityProvider.getIdentity()
    let url = null

    if (identity.isSupervisor()) {
      url = '/api/task/hit/index'
    } else if (identity.isTeam()) {
      url = `/api/team/${identity.id}/hits`
    } else {
      promise.reject('Unknown error. Please try again later.')
    }

    if (identity.isSupervisor() || identity.isTeam()) {
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
    }

    return promise
  }
}

export default new ContestProvider()
