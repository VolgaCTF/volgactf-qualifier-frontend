import $ from 'jquery'
import _ from 'underscore'
import EventEmitter from 'wolfy87-eventemitter'
import TeamModel from '../models/team'
import identityProvider from './identity'
import dataStore from '../data-store'

class TeamProvider extends EventEmitter {
  constructor () {
    super()
    this.teams = []

    this.onUpdateProfile = null
    this.onCreate = null
    this.onUpdateEmail = null
    this.onQualify = null
    this.onDisqualify = null
    this.onUpdatePassword = null
    this.onUpdateLogo = null
    this.onLogin = null
    this.onLogout = null
  }

  getTeams () {
    return this.teams
  }

  subscribe () {
    if (!dataStore.supportsRealtime()) {
      return
    }

    let realtimeProvider = dataStore.getRealtimeProvider()
    let identity = identityProvider.getIdentity()

    this.onUpdateProfile = (e) => {
      let options = JSON.parse(e.data)
      let team = new TeamModel(options)
      let ndx = _.findIndex(this.teams, { id: options.id })
      if (ndx > -1) {
        this.teams.splice(ndx, 1)
        this.teams.push(team)
        this.trigger('updateTeamProfile', [team, new Date(options.__metadataCreatedAt)])
      }
    }

    realtimeProvider.addEventListener('updateTeamProfile', this.onUpdateProfile)

    this.onQualify = (e) => {
      let options = JSON.parse(e.data)
      let team = new TeamModel(options)
      let ndx = _.findIndex(this.teams, { id: options.id })
      if (ndx > -1) {
        this.teams.splice(ndx, 1)
      }
      this.teams.push(team)
      this.trigger('qualifyTeam', [team, new Date(options.__metadataCreatedAt)])
    }

    realtimeProvider.addEventListener('qualifyTeam', this.onQualify)

    this.onDisqualify = (e) => {
      let options = JSON.parse(e.data)
      let team = new TeamModel(options)
      let ndx = _.findIndex(this.teams, { id: options.id })
      if (ndx > -1) {
        this.teams.splice(ndx, 1)
      }
      if (identity.isSupervisor()) {
        this.teams.push(team)
      }
      this.trigger('disqualifyTeam', [team, new Date(options.__metadataCreatedAt)])
    }

    realtimeProvider.addEventListener('disqualifyTeam', this.onDisqualify)

    if (identity.isSupervisor()) {
      this.onCreate = (e) => {
        let options = JSON.parse(e.data)
        let team = new TeamModel(options)
        this.teams.push(team)
        this.trigger('createTeam', [team, new Date(options.__metadataCreatedAt)])
      }

      realtimeProvider.addEventListener('createTeam', this.onCreate)

      this.onUpdateEmail = (e) => {
        let options = JSON.parse(e.data)
        let team = new TeamModel(options)
        let ndx = _.findIndex(this.teams, { id: options.id })
        if (ndx > -1) {
          this.teams.splice(ndx, 1)
        }
        this.teams.push(team)
        this.trigger('updateTeamEmail', [team, new Date(options.__metadataCreatedAt)])
      }

      realtimeProvider.addEventListener('updateTeamEmail', this.onUpdateEmail)

      this.onUpdatePassword = (e) => {
        let options = JSON.parse(e.data)
        let team = new TeamModel(options)
        this.trigger('updateTeamPassword', [team, new Date(options.__metadataCreatedAt)])
      }

      realtimeProvider.addEventListener('updateTeamPassword', this.onUpdatePassword)

      this.onUpdateLogo = (e) => {
        let options = JSON.parse(e.data)
        let team = new TeamModel(options)
        this.trigger('updateTeamLogo', [team, new Date(options.__metadataCreatedAt)])
      }

      realtimeProvider.addEventListener('updateTeamLogo', this.onUpdateLogo)

      this.onLogin = (e) => {
        let options = JSON.parse(e.data)
        let team = new TeamModel(options)
        this.trigger('loginTeam', [team, new Date(options.__metadataCreatedAt)])
      }

      realtimeProvider.addEventListener('loginTeam', this.onLogin)

      this.onLogout = (e) => {
        let options = JSON.parse(e.data)
        let team = new TeamModel(options)
        this.trigger('logoutTeam', [team, new Date(options.__metadataCreatedAt)])
      }

      realtimeProvider.addEventListener('logoutTeam', this.onLogout)
    }
  }

  unsubscribe () {
    if (!dataStore.supportsRealtime()) {
      return
    }

    let realtimeProvider = dataStore.getRealtimeProvider()

    if (this.onUpdateProfile) {
      realtimeProvider.removeEventListener('updateTeamProfile', this.onUpdateProfile)
      this.onUpdateProfile = null
    }

    if (this.onCreate) {
      realtimeProvider.removeEventListener('createTeam', this.onCreate)
      this.onCreate = null
    }

    if (this.onUpdateEmail) {
      realtimeProvider.removeEventListener('updateTeamEmail', this.onUpdateEmail)
      this.onUpdateEmail = null
    }

    if (this.onQualify) {
      realtimeProvider.removeEventListener('qualifyTeam', this.onQualify)
      this.onQualify = null
    }

    if (this.onDisqualify) {
      realtimeProvider.removeEventListener('disqualifyTeam', this.onDisqualify)
      this.onDisqualify = null
    }

    if (this.onUpdatePassword) {
      realtimeProvider.removeEventListener('updateTeamPassword', this.onUpdatePassword)
      this.onUpdatePassword = null
    }

    if (this.onUpdateLogo) {
      realtimeProvider.removeEventListener('updateTeamLogo', this.onUpdateLogo)
      this.onUpdateLogo = null
    }

    if (this.onLogin) {
      realtimeProvider.removeEventListener('loginTeam', this.onLogin)
      this.onLogin = null
    }

    if (this.onLogout) {
      realtimeProvider.removeEventListener('logoutTeam', this.onLogout)
      this.onLogout = null
    }
  }

  fetchTeamProfile (id) {
    let promise = $.Deferred()
    let url = `/api/team/${id}/profile`

    $.ajax({
      url: url,
      dataType: 'json',
      success: (responseJSON, textStatus, jqXHR) => {
        promise.resolve(new TeamModel(responseJSON))
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

  fetchTeams (callback) {
    let promise = $.Deferred()
    let url = '/api/team/index'

    $.ajax({
      url: url,
      dataType: 'json',
      success: (responseJSON, textStatus, jqXHR) => {
        this.teams = _.map(responseJSON, (options) => {
          return new TeamModel(options)
        })

        promise.resolve(this.teams)
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

export default new TeamProvider()
