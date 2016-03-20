import $ from 'jquery'
import _ from 'underscore'
import EventEmitter from 'wolfy87-eventemitter'
import dataStore from '../data-store'
import ContestModel from '../models/contest'
import TeamModel from '../models/team'
import TeamScoreModel from '../models/team-score'

class ContestProvider extends EventEmitter {
  constructor () {
    super()
    this.contest = null
    this.teamScores = []

    this.onUpdate = null
    this.onUpdateTeamScore = null
    this.onQualifyTeam = null
    this.onDisqualifyTeam = null
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

    this.onDisqualifyTeam = (e) => {
      let options = JSON.parse(e.data)
      let team = new TeamModel(options)
      let ndx = _.findIndex(this.teamScores, { teamId: team.id })
      if (ndx > -1) {
        this.teamScores.splice(ndx, 1)
      }
      let teamScore = new TeamScoreModel({
        teamId: team.id,
        score: 0,
        updatedAt: null
      })
      this.trigger('updateTeamScore', [teamScore, new Date(options.__metadataCreatedAt)])
    }

    realtimeProvider.addEventListener('disqualifyTeam', this.onDisqualifyTeam)
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

    if (this.onDisqualifyTeam) {
      realtimeProvider.removeEventListener('disqualifyTeam', this.onDisqualifyTeam)
      this.onDisqualifyTeam = null
    }

    this.contest = null
    this.teamScores = []
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
}

export default new ContestProvider()
