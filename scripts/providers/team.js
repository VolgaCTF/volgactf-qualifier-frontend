import $ from 'jquery'
import _ from 'underscore'
import EventEmitter from 'wolfy87-eventemitter'
import TeamModel from '../models/team'
import metadataStore from '../utils/metadata-store'
import identityProvider from './identity'
import dataStore from '../data-store'


class TeamProvider extends EventEmitter {
  constructor() {
    super()
    this.teams = []

    this.onUpdateProfile = null
    this.onCreate = null
    this.onChangeEmail = null
    this.onQualify = null
  }

  getTeams() {
    return this.teams
  }

  subscribe() {
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
        this.trigger('updateTeamProfile', [team])
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
      this.trigger('qualifyTeam', [team])
    }

    realtimeProvider.addEventListener('qualifyTeam', this.onQualify)

    if (_.contains(['admin', 'manager'], identity.role)) {
      this.onCreate = (e) => {
        let options = JSON.parse(e.data)
        let team = new TeamModel(options)
        this.teams.push(team)
        this.trigger('createTeam', [team])
      }

      realtimeProvider.addEventListener('createTeam', this.onCreate)

      this.onChangeEmail = (e) => {
        let options = JSON.parse(e.data)
        let team = new TeamModel(options)
        let ndx = _.findIndex(this.teams, { id: options.id })
        if (ndx > -1) {
          this.teams.splice(ndx, 1)
        }
        this.teams.push(team)
        this.trigger('changeTeamEmail', [team])
      }

      realtimeProvider.addEventListener('changeTeamEmail', this.onChangeEmail)
    }
  }

  unsubscribe() {
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

    if (this.onChangeEmail) {
      realtimeProvider.removeEventListener('changeTeamEmail', this.onChangeEmail)
      this.onChangeEmail = null
    }

    if (this.onQualify) {
      realtimeProvider.removeEventListener('qualifyTeam', this.onQualify)
      this.onQualify = null
    }
  }

  fetchTeamProfile(id) {
    let promise = $.Deferred()
    let url = `/api/team/${id}/profile`

    $.ajax({
      url: url,
      dataType: 'json',
      xhrFields: {
        withCredentials: true
      },
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

  fetchTeams(callback) {
    let promise = $.Deferred()
    let url = '/api/team/all'

    $.ajax({
      url: url,
      dataType: 'json',
      xhrFields: {
        withCredentials: true
      },
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
