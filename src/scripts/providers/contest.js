import $ from 'jquery'
import EventEmitter from 'wolfy87-eventemitter'
import dataStore from '../data-store'
import ContestModel from '../models/contest'

class ContestProvider extends EventEmitter {
  constructor () {
    super()
    this.contest = null

    this.onUpdate = null
  }

  getContest () {
    return this.contest
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
  }

  initContest () {
    const promise = $.Deferred()
    this.contest = new ContestModel(window.themis.quals.data.contest)
    promise.resolve(this.contest)

    return promise
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
}

export default new ContestProvider()
