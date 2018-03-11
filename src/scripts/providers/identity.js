import $ from 'jquery'
import IdentityModel from '../models/identity'

class IdentityProvider {
  constructor () {
    this.identity = null
  }

  subscribe () {
  }

  getIdentity () {
    return this.identity
  }

  initIdentity () {
    const promise = $.Deferred()
    this.identity = new IdentityModel(window.themis.quals.data.identity)
    promise.resolve(this.identity)

    return promise
  }

  fetchIdentity () {
    let promise = $.Deferred()
    let url = '/api/identity'

    $.ajax({
      url: url,
      dataType: 'json',
      success: (responseJSON, textStatus, jqXHR) => {
        this.identity = new IdentityModel(responseJSON)
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
