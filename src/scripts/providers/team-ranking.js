import $ from 'jquery'
import _ from 'underscore'
import EventEmitter from 'wolfy87-eventemitter'
import dataStore from '../data-store'
import TeamRankingModel from '../models/team-ranking'

class TeamRankingProvider extends EventEmitter {
  constructor () {
    super()
    this.teamRankings = []

    this.onUpdate = null
  }

  getTeamRankings () {
    return this.teamRankings
  }

  subscribe () {
    if (!dataStore.supportsRealtime()) {
      return
    }

    const realtimeProvider = dataStore.getRealtimeProvider()

    this.onUpdate = (e) => {
      const data = JSON.parse(e.data)
      this.teamRankings = _.map(data.collection, function (options) {
        return new TeamRankingModel(options)
      })
      this.trigger('updateTeamRankings', [this.teamRankings, new Date(data.__metadataCreatedAt)])
    }
    realtimeProvider.addEventListener('updateTeamRankings', this.onUpdate)
  }

  fetchTeamRankings () {
    const promise = $.Deferred()

    $.ajax({
      url: '/api/team/ranking/index',
      dataType: 'json',
      success: (responseJSON, textStatus, jqXHR) => {
        this.teamRankings = _.map(responseJSON, (options) => {
          return new TeamRankingModel(options)
        })

        promise.resolve(this.teamRankings)
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

export default new TeamRankingProvider()
