define 'contestProvider', ['jquery', 'underscore', 'EventEmitter', 'dataStore', 'metadataStore', 'contestModel', 'teamScoreModel', 'teamProvider', 'teamTaskProgressModel', 'identityProvider'], ($, _, EventEmitter, dataStore, metadataStore, ContestModel, TeamScoreModel, teamProvider, TeamTaskProgressModel, identityProvider) ->
    
import $ from 'jquery'
import _ from 'underscore'
import EventEmitter from 'EventEmitter'

import dataStore from '../data-store'
import metadataStore from '../utils/metadata-store'
import ContestModel from '../models/contest'
import TeamScoreModel from '../models/team-score'
import TeamTaskProgressModel from '../models/team-task-progress'
import teamProvider from './team'
import identityProvider from './identity' 

class ContestProvider extends EventEmitter {
  constructor() {
     super()
     this.contest = null
     this.teamScores = []
     this.teamTaskProgressEntries = []

     this.onUpdate = null
     this.onUpdateTeamScore = null
     this.onQualifyTeam = null

     this.onCreateTeamTaskProgress = null
  }

  getContest() {
    return this.contest
  }
        
  getTeamScores() {
    return this.teamScores
  }
        
  teamRankFunc(a, b) {
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
      } else if (a.updatedAt && (!b.updatedAt)) {
        return -1
      } else if ((!a.updatedAt) && b.updatedAt) {
        return 1
      } else {
        return 0
      }
    }
  }

  getTeamTaskProgressEntries() {
    return this.teamTaskProgressEntries
  }	    

  subscribe() {
    if (!dataStore.supportsRealtime()) {
      return }

    let realtimeProvider = dataStore.getRealtimeProvider()
  
    this.onUpdate = ((e) => {
      let options = JSON.parse(e.data)
      this.contest = new ContestModel(options)
      return this.trigger('updateContest', [this.contest])
    })

    realtimeProvider.addEventListener('updateContest', this.onUpdate)

    this.onUpdateTeamScore = ((e) => {
      let options = JSON.parse(e.data)
      let teamScore = new TeamScoreModel(options)
      let ndx = _.findIndex(this.teamScores, {teamId: options.teamId})
      if (ndx > -1) {
        this.teamScores.splice(ndx, 1)
      }
      this.teamScores.push(teamScore)
      return this.trigger('updateTeamScore', [teamScore])
    })

    realtimeProvider.addEventListener('updateTeamScore', this.onUpdateTeamScore)

    this.nQualifyTeam = ((team) => {
      let ndx = _.findIndex(this.teamScores, {teamId: team.id})
      if (ndx === -1) {
        let teamScore = new TeamScoreModel({teamId: team.id, score: 0, updatedAt: null})  
        this.teamScores.push(teamScore)
        return this.trigger('updateTeamScore', [teamScore])
      }
    })
      
    teamProvider.on('qualifyTeam', this.onQualifyTeam)

    // identity = identityProvider.getIdentity()
    if (_.contains (['admin', 'manager', 'team'], identity.role)) {
      this.onCreateTeamTaskProgress = ((e) => {
	let identity = identityProvider.getIdentity() 
	let options = JSON.parse(e.data)
        let teamTaskProgress = new TeamTaskProgressModel(options)
        let ndx = _.findIndex(this.teamTaskProgressEntries, {teamId: options.teamId, taskId: options.taskId})
        if (ndx === -1) {
          if ((identity.role === 'team') && (identity.id !== options.teamId)) {
            return
          }
          this.teamTaskProgressEntries.push(teamTaskProgress)
          return this.trigger ('createTeamTaskProgress', [teamTaskProgress])
	}
      })
    }	  

    realtimeProvider.addEventListener('createTeamTaskProgress', this.onCreateTeamTaskProgress, false)
  }

  unsubscribe() {
    
    if (!dataStore.supportsRealtime()) {
      return
    }	      
    
    let realtimeProvider = dataStore.getRealtimeProvider()

    if (this.onUpdate !== null) {
      realtimeProvider.removeEventListener('updateContest', this.onUpdate)
      this.onUpdate = null
    }
    
    if (this.onUpdateTeamScore !== null) {
      realtimeProvider.removeEventListener('updateTeamScore', this.onUpdateTeamScore)
      this.onUpdateTeamScore = null
    }

    if (this.onQualifyTeam !== null) {
      teamProvider.off('qualifyTeam', this.onQualifyTeam)
      this.onQualifyTeam = null
    }

    if (this.onCreateTeamTaskProgress !== null) {
      realtimeProvider.removeEventListener('createTeamTaskProgress', this.onCreateTeamTaskProgress)
      this.onCreateTeamTaskProgress = null
    }
    
    this.contest = null
    this.teamScores = []
    this.teamTaskProgressEntries = []

  }
  
  fetchContest() {
    let promise = $.Deferred()
    let url = "#{metadataStore.getMetadata 'domain-api' }/contest"
    $.ajax({
	url: url, 
	dataType: 'json',
        xhrFields: {withCredentials: yes},
        success: ((responseJSON, textStatus, jqXHR) => {
          this.contest = new ContestModel(responseJSON)
          promise.resolve(this.contest)
	}),
        error: ((jqXHR, textStatus, errorThrown) => {
          if (jqXHR.responseJSON !== null) {
            promise.rejectjqXHR(responseJSON)
	  } else {
          promise.reject('Unknown error. Please try again later.')
          }
	})
    })
    return promise
  }

  fetchTeamScores() {
    let promise = $.Deferred()
    let url = "#{metadataStore.getMetadata 'domain-api' }/contest/scores"
    $.ajax({
	url: url,
        dataType: 'json',
        xhrFields: {withCredentials: yes},
        success: ((responseJSON, textStatus, jqXHR) => {
        this.teamScores = _.map(responseJSON, (options) {
          return new TeamScoreModel(options)
          })
	promise.resolve(this.teamScores)
        }),
        error: ((jqXHR, textStatus, errorThrown) => {
          if (jqXHR.responseJSON) {
            promise.reject(jqXHR.responseJSON)
          } else {
            promise.reject('Unknown error. Please try again later.')
	  }
	})
    })
    return promise
  }

  fetchSolvedTeamCountByTask(taskId) {
    let promise = $.Deferred()
    let url = "#{metadataStore.getMetadata 'domain-api' }/contest/task/#{taskId}/progress"
    $.ajax({
        url: url,
        dataType: 'json',
        xhrFields: {withCredentials: yes},
        success: ((responseJSON, textStatus, jqXHR) => {
          promise.resolve(responseJSON)
	}),
        error: ((jqXHR, textStatus, errorThrown) => {
          if (jqXHR.responseJSON) {
            promise.reject(jqXHR.responseJSON)
          } else {
             promise.reject('Unknown error. Please try again later.')
          }
        })
    })
    return promise
  }

  fetchTeamTaskProgress(teamId) {
    let promise = $.Deferred()
    let identity = identityProvider.getIdentity()
    let url = "#{metadataStore.getMetadata 'domain-api' }/contest/team/#{teamId}/progress"

    $.ajax({
        url: url,
        dataType: 'json',
        xhrFields: {withCredentials: yes},
        success: ((responseJSON, textStatus, jqXHR) => {
          if ((_.contains(['admin', 'manager'], identity.role)) || (identity.role === 'team' && identity.id === teamId)) {
            teamTaskProgressEntries = _.map(responseJSON, ((options) => {
              return new TeamTaskProgressModel(options)
            })
            )
            promise.resolve(teamTaskProgressEntries)
          
	  }else {
            promise.resolve(responseJSON)
          }
	}),
        error: ((jqXHR, textStatus, errorThrown) => {
          if (jqXHR.responseJSON) {
            promise.reject jqXHR.responseJSON
	  }
          else {
          promise.reject 'Unknown error. Please try again later.'
          }
	})
    })
  
    return promise
  }

  fetchTeamTaskProgressEntries() {
    let promise = $.Deferred()
    let identity = identityProvider.getIdentity()
    if (_.contains(['admin', 'manager']), identity.role) {
      let url = "#{metadataStore.getMetadata 'domain-api' }/contest/progress"
    } else { 
      if (identity.role === 'team') {
        let url = "#{metadataStore.getMetadata 'domain-api' }/contest/team/#{identity.id}/progress"
      }
    } else {
      promise.reject('Unknown error. Please try again later.')
    }
    
    if (_.contains(['admin', 'manager', 'team']), identity.role) {
      $.ajax({
	  url: url,
          dataType: 'json',
          xhrFields: {withCredentials: yes},
	  success: ((responseJSON, textStatus, jqXHR) => {
            this.teamTaskProgressEntries = _.map(responseJSON, ((options) => {
              new TeamTaskProgressModel(options)
	    })
            )
            promise.resolve(this.teamTaskProgressEntries)
          }),
          error: ((jqXHR, textStatus, errorThrown) => {
            if (jqXHR.responseJSON) {
              promise.reject(jqXHR.responseJSON)
            } else {
              promise.reject('Unknown error. Please try again later.')
            }
	  })
      })
    return promise
  }		  

export default new ContestProvider()
