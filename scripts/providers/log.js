import $ from 'jquery'
import _ from 'underscore'
import dataStore from '../data-store'
import EventEmitter from 'wolfy87-eventemitter'
import metadataStore from '../utils/metadata-store'
import LogModel from '../models/log'


class LogProvider extends EventEmitter {
  constructor() {
    super()
    this.logs = []
    this.onCreate = null
  }

  getLogs() {
    return this.logs
  }

  subscribe() {
    if (!dataStore.supportsRealtime()) {
      return
    }

    let realtimeProvider = dataStore.getRealtimeProvider()

    this.onCreate = (e) => {
      let options = JSON.parse(e.data)
      let log = new LogModel(options)
      this.logs.push(log)
      this.trigger('createLog', [log])
    }

    realtimeProvider.addEventListener('createLog', this.onCreate)
  }

  unsubscribe() {
    if (!dataStore.supportsRealtime()) {
      return
    }

    let realtimeProvider = dataStore.getRealtimeProvider()

    if (this.onCreate) {
      realtimeProvider.removeEventListener('createLog', this.onCreate)
      this.onCreate = null
    }

    this.logs = []
  }

  fetchLogs() {
    let promise = $.Deferred()
    let url = '/api/contest/logs'

    $.ajax({
      url: url,
      dataType: 'json',
      xhrFields: {
        withCredentials: true
      },
      success: (responseJSON, textStatus, jqXHR) => {
        this.logs = _.map(responseJSON, (options) => {
          return new LogModel(options)
        })

        promise.resolve(this.logs)
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


export default new LogProvider()
