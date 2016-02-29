import $ from 'jquery'
import _ from 'underscore'
import EventEmitter from 'wolfy87-eventemitter'
import CountryModel from '../models/country'

class CountryProvider extends EventEmitter {
  constructor () {
    super()
    this.countries = []
  }

  getCountries () {
    return this.countries
  }

  fetchCountries () {
    let promise = $.Deferred()
    let url = '/api/country/all'

    $.ajax({
      url: url,
      dataType: 'json',
      success: (responseJSON, textStatus, jqXHR) => {
        this.countries = _.map(responseJSON, (options) => {
          return new CountryModel(options)
        })

        promise.resolve(this.countries)
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

export default new CountryProvider()
