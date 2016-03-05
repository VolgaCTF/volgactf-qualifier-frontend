import $ from 'jquery'
import _ from 'underscore'
import dataStore from '../data-store'
import EventEmitter from 'wolfy87-eventemitter'
import CategoryModel from '../models/category'

class CategoryProvider extends EventEmitter {
  constructor () {
    super()
    this.categories = []

    this.onCreate = null
    this.onUpdate = null
    this.onDelete = null
  }

  getCategories () {
    return this.categories
  }

  subscribe () {
    if (!dataStore.supportsRealtime()) {
      return
    }

    let realtimeProvider = dataStore.getRealtimeProvider()

    this.onCreate = (e) => {
      let options = JSON.parse(e.data)
      let category = new CategoryModel(options)
      this.categories.push(category)
      this.trigger('createCategory', [category])
    }

    realtimeProvider.addEventListener('createCategory', this.onCreate)

    this.onUpdate = (e) => {
      let options = JSON.parse(e.data)
      let category = new CategoryModel(options)
      let ndx = _.findIndex(this.categories, { id: category.id })
      if (ndx > -1) {
        this.categories.splice(ndx, 1)
      }
      this.categories.push(category)
      this.trigger('updateCategory', [category])
    }

    realtimeProvider.addEventListener('updateCategory', this.onUpdate)

    this.onDelete = (e) => {
      let options = JSON.parse(e.data)
      let ndx = _.findIndex(this.categories, { id: options.id })

      if (ndx > -1) {
        this.categories.splice(ndx, 1)
        this.trigger('deleteCategory', [options.id])
      }
    }

    realtimeProvider.addEventListener('deleteCategory', this.onDelete)
  }

  unsubscribe () {
    if (!dataStore.supportsRealtime()) {
      return
    }

    let realtimeProvider = dataStore.getRealtimeProvider()

    if (this.onCreate) {
      realtimeProvider.removeEventListener('createCategory', this.onCreate)
      this.onCreate = null
    }

    if (this.onUpdate) {
      realtimeProvider.removeEventListener('updateCategory', this.onUpdate)
      this.onUpdate = null
    }

    if (this.onDelete) {
      realtimeProvider.removeEventListener('deleteCategory', this.onDelete)
      this.onDelete = null
    }

    this.categories = []
  }

  fetchCategories () {
    let promise = $.Deferred()
    let url = '/api/category/index'

    $.ajax({
      url: url,
      dataType: 'json',
      success: (responseJSON, textStatus, jqXHR) => {
        this.categories = _.map(responseJSON, (options) => {
          return new CategoryModel(options)
        })

        promise.resolve(this.categories)
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

  deleteCategory (id, token) {
    let promise = $.Deferred()
    let url = `/api/category/${id}/delete`

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

export default new CategoryProvider()
