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

    const realtimeProvider = dataStore.getRealtimeProvider()

    this.onCreate = (e) => {
      const options = JSON.parse(e.data)
      const category = new CategoryModel(options)
      this.categories.push(category)
      this.trigger('createCategory', [category, new Date(options.__metadataCreatedAt)])
    }

    realtimeProvider.addEventListener('createCategory', this.onCreate)

    this.onUpdate = (e) => {
      const options = JSON.parse(e.data)
      const category = new CategoryModel(options)
      const ndx = _.findIndex(this.categories, { id: category.id })
      if (ndx > -1) {
        this.categories.splice(ndx, 1)
      }
      this.categories.push(category)
      this.trigger('updateCategory', [category, new Date(options.__metadataCreatedAt)])
    }

    realtimeProvider.addEventListener('updateCategory', this.onUpdate)

    this.onDelete = (e) => {
      const options = JSON.parse(e.data)
      const ndx = _.findIndex(this.categories, { id: options.id })

      if (ndx > -1) {
        this.categories.splice(ndx, 1)
        const category = new CategoryModel(options)
        this.trigger('deleteCategory', [category, new Date(options.__metadataCreatedAt)])
      }
    }

    realtimeProvider.addEventListener('deleteCategory', this.onDelete)
  }

  initCategories () {
    const promise = $.Deferred()
    this.categories = _.map(window.volgactf.qualifier.data.categories, function (options) {
      return new CategoryModel(options)
    })
    promise.resolve(this.categories)
    return promise
  }

  fetchCategories () {
    const promise = $.Deferred()
    const url = '/api/category/index'

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
    const promise = $.Deferred()
    const url = `/api/category/${id}/delete`

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
