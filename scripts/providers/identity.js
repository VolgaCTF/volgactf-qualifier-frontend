import $ from 'jquery'
import metadataStore from '../utils/metadata-store'


class IdentityProvider {
  constructor() {
    this.identity = null
  }

  subscribe() {
  }

  unsubscribe() {
    this.identity = null
  }

  getIdentity() {
    return this.identity
  }

  fetchIdentity() {
    let promise = $.Deferred()
    let url = '/api/identity'

    $.ajax({
      url: url,
      dataType: 'json',
      xhrFields: {
        withCredentials: true
      },
      success: (responseJSON, textStatus, jqXHR) => {
        this.identity = responseJSON
        promise.resolve(this.identity)
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


export default new IdentityProvider()
