import $ from 'jquery'
import _ from 'underscore'
import dataStore from '../data-store'
import metadataStore from '../utils/metadata-store'
import EventEmitter from 'wolfy87-eventemitter'
import TaskCategoryModel from '../models/task-category'


class TaskCategoryProvider extends EventEmitter {
  constructor() {
    super()
    this.taskCategories = []

    this.onCreate = null
    this.onUpdate = null
    this.onRemove = null
  }

  getTaskCategories() {
    return this.taskCategories
  }

  subscribe() {
    if (!dataStore.supportsRealtime()) {
      return
    }

    let realtimeProvider = dataStore.getRealtimeProvider()

    this.onCreate = (e) => {
      let options = JSON.parse(e.data)
      let taskCategory = new TaskCategoryModel(options)
      this.taskCategories.push(taskCategory)
      this.trigger('createTaskCategory', [taskCategory])
    }

    realtimeProvider.addEventListener('createTaskCategory', this.onCreate)

    this.onUpdate = (e) => {
      let options = JSON.parse(e.data)
      let taskCategory = new TaskCategoryModel(options)
      let ndx = _.findIndex(this.taskCategories, { id: taskCategory.id })
      if (ndx > -1) {
        this.taskCategories.splice(ndx, 1)
      }
      this.taskCategories.push(taskCategory)
      this.trigger('updateTaskCategory', [taskCategory])
    }

    realtimeProvider.addEventListener('updateTaskCategory', this.onUpdate)

    this.onRemove = (e) => {
      let options = JSON.parse(e.data)
      let ndx = _.findIndex(this.taskCategories, { id: options.id })

      if (ndx > -1) {
        this.taskCategories.splice(ndx, 1)
        this.trigger('removeTaskCategory', [options.id])
      }
    }

    realtimeProvider.addEventListener('removeTaskCategory', this.onRemove)
  }

  unsubscribe() {
    if (!dataStore.supportsRealtime()) {
      return
    }

    let realtimeProvider = dataStore.getRealtimeProvider()

    if (this.onCreate) {
      realtimeProvider.removeEventListener('createTaskCategory', this.onCreate)
      this.onCreate = null
    }

    if (this.onUpdate) {
      realtimeProvider.removeEventListener('updateTaskCategory', this.onUpdate)
      this.onUpdate = null
    }

    if (this.onRemove) {
      realtimeProvider.removeEventListener('removeTaskCategory', this.onRemove)
      this.onRemove = null
    }

    this.taskCategories = []
  }

  fetchTaskCategories() {
    let promise = $.Deferred()
    let url = `${metadataStore.getMetadata('domain-api')}/task/category/all`

    $.ajax({
      url: url,
      dataType: 'json',
      xhrFields: {
        withCredentials: true
      },
      success: (responseJSON, textStatus, jqXHR) => {
        this.taskCategories = _.map(responseJSON, (options) => {
          return new TaskCategoryModel(options)
        })

        promise.resolve(this.taskCategories)
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

  removeTaskCategory(id, token) {
    let promise = $.Deferred()
    let url = `${metadataStore.getMetadata('domain-api')}/task/category/${id}/remove`

    $.ajax({
      url: url,
      type: 'POST',
      dataType: 'json',
      data: {},
      xhrFields: {
        withCredentials: true
      },
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


export default new TaskCategoryProvider()
