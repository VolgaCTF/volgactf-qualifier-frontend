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

  initTeamRankings () {
    const promise = $.Deferred()
    this.teamRankings = _.map(window.themis.quals.data.teamRankings, function (options) {
      return new TeamRankingModel(options)
    })
    promise.resolve(this.teamRankings)

    return promise
  }
}

export default new TeamRankingProvider()
