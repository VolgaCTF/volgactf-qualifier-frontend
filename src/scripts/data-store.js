class DataStore {
  constructor () {
    this.eventSource = null

    this.onEventSourceOpenHandlers = []
    this.onEventSourceError = null
  }

  supportsRealtime () {
    return !!window.EventSource
  }

  getRealtimeConnectionState () {
    return (this.supportsRealtime() && this.eventSource) ? this.eventSource.readyState : 2
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
    for (const func of this.onEventSourceOpenHandlers) {
      this.eventSource.addEventListener('open', func)
    }
    this.eventSource.addEventListener('error', this.onEventSourceError)
  }

  disconnectRealtime () {
    if (this.eventSource) {
      for (const func of this.onEventSourceOpenHandlers) {
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
