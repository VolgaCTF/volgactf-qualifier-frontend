import $ from 'jquery'
import _ from 'underscore'
import dataStore from '../data-store'
import EventEmitter from 'wolfy87-eventemitter'
import RemoteCheckerModel from '../models/remote-checker'

class RemoteCheckerProvider extends EventEmitter {
  constructor () {
    super()
    this.remoteCheckers = []

    this.onCreate = null
    this.onUpdate = null
    this.onDelete = null
  }

  getRemoteCheckers () {
    return this.remoteCheckers
  }

  subscribe () {
    if (!dataStore.supportsRealtime()) {
      return
    }

    let realtimeProvider = dataStore.getRealtimeProvider()

    this.onCreate = (e) => {
      const options = JSON.parse(e.data)
      const remoteChecker = new RemoteCheckerModel(options)
      this.remoteCheckers.push(remoteChecker)
      this.trigger('createRemoteChecker', [remoteChecker, new Date(options.__metadataCreatedAt)])
    }

    realtimeProvider.addEventListener('createRemoteChecker', this.onCreate)

    this.onUpdate = (e) => {
      const options = JSON.parse(e.data)
      const remoteChecker = new RemoteCheckerModel(options)
      const ndx = _.findIndex(this.remoteCheckers, { id: remoteChecker.id })
      if (ndx > -1) {
        this.remoteCheckers.splice(ndx, 1)
      }
      this.remoteCheckers.push(remoteChecker)
      this.trigger('updateRemoteChecker', [remoteChecker, new Date(options.__metadataCreatedAt)])
    }

    realtimeProvider.addEventListener('updateRemoteChecker', this.onUpdate)

    this.onDelete = (e) => {
      const options = JSON.parse(e.data)
      const ndx = _.findIndex(this.remoteCheckers, { id: options.id })

      if (ndx > -1) {
        this.remoteCheckers.splice(ndx, 1)
        const remoteChecker = new RemoteCheckerModel(options)
        this.trigger('deleteRemoteChecker', [remoteChecker, new Date(options.__metadataCreatedAt)])
      }
    }

    realtimeProvider.addEventListener('deleteRemoteChecker', this.onDelete)
  }

  unsubscribe () {
    if (!dataStore.supportsRealtime()) {
      return
    }

    let realtimeProvider = dataStore.getRealtimeProvider()

    if (this.onCreate) {
      realtimeProvider.removeEventListener('createRemoteChecker', this.onCreate)
      this.onCreate = null
    }

    if (this.onUpdate) {
      realtimeProvider.removeEventListener('updateRemoteChecker', this.onUpdate)
      this.onUpdate = null
    }

    if (this.onDelete) {
      realtimeProvider.removeEventListener('deleteRemoteChecker', this.onDelete)
      this.onDelete = null
    }

    this.remoteCheckers = []
  }

  initRemoteCheckers () {
    const promise = $.Deferred()
    this.remoteCheckers = _.map(window.themis.quals.data.remoteCheckers, function (options) {
      return new RemoteCheckerModel(options)
    })
    promise.resolve(this.categories)
    return promise
  }

  deleteRemoteChecker (id, token) {
    let promise = $.Deferred()
    let url = `/api/remote_checker/${id}/delete`

    $.ajax({
      url: url,
      type: 'POST',
      dataType: 'json',
      data: {},
      headers: {
        'X-CSRF-Token': token
      },
      success: (responseJSON, textStatus, jqXHR) => {
        promise.resolve()
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

export default new RemoteCheckerProvider()
