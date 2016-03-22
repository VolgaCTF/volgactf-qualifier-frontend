import $ from 'jquery'

class DataStore {
  constructor () {
    this.eventSource = null

    this.onEventSourceOpenHandlers = []
    this.onEventSourceError = null
  }

  verifyEmail (data, token, callback) {
    return $.ajax({
      url: '/api/team/verify-email',
      type: 'POST',
      dataType: 'json',
      data: data,
      headers: {
        'X-CSRF-Token': token
      },
      success: (responseJSON, textStatus, jqXHR) => {
        callback(null, responseJSON)
      },
      error: (jqXHR, textStatus, errorThrown) => {
        if (jqXHR.responseJSON) {
          callback(jqXHR.responseJSON, null)
        } else {
          callback('Unknown error. Please try again later.', null)
        }
      }
    })
  }

  supportsRealtime () {
    return !!window.EventSource
  }

  getRealtimeConnectionState () {
    if (this.supportsRealtime()) {
      return this.eventSource ? this.eventSource.readyState : 999
    } else {
      return -1
    }
  }

  connectedRealtime () {
    return (this.supportsRealtime() && this.eventSource && this.eventSource.readyState === 1)
  }

  onConnectedRealtime (func) {
    this.onEventSourceOpenHandlers.push(func)
  }

  connectRealtime () {
    if (!this.onEventSourceError) {
      this.onEventSourceError = (e) => {
        this.disconnectRealtime()
      }
    }

    this.eventSource = new window.EventSource('/api/stream')
    for (let func of this.onEventSourceOpenHandlers) {
      this.eventSource.addEventListener('open', func)
    }
    this.eventSource.addEventListener('error', this.onEventSourceError)
  }

  disconnectRealtime () {
    if (this.eventSource) {
      for (let func of this.onEventSourceOpenHandlers) {
        this.eventSource.removeEventListener('open', func)
      }
      if (this.onEventSourceError) {
        this.eventSource.removeEventListener('error', this.onEventSourceError)
        this.onEventSourceError = null
      }
      this.eventSource.close()
      this.eventSource = null
    }
  }

  getRealtimeProvider () {
    return this.eventSource
  }
}

export default new DataStore()
