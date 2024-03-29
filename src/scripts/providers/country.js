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

  initCountries () {
    const promise = $.Deferred()
    this.countries = _.map(window.volgactf.qualifier.data.countries, (options) => {
      return new CountryModel(options)
    })
    promise.resolve(this.countries)

    return promise
  }

  fetchCountries () {
    const promise = $.Deferred()
    const url = '/api/country/index'

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
