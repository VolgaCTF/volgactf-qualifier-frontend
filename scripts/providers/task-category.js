import $ from 'jquery'
import _ from 'underscore'
import dataStore from '../data-store'
import EventEmitter from 'wolfy87-eventemitter'
import TaskCategoryModel from '../models/task-category'

class TaskCategoryProvider extends EventEmitter {
  constructor () {
    super()
    this.taskCategories = []

    this.onCreate = null
  }

  getTaskCategories () {
    return this.taskCategories
  }

  subscribe () {
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
  }

  unsubscribe () {
    if (!dataStore.supportsRealtime()) {
      return
    }

    let realtimeProvider = dataStore.getRealtimeProvider()

    if (this.onCreate) {
      realtimeProvider.removeEventListener('createTaskCategory', this.onCreate)
      this.onCreate = null
    }

    this.categories = []
  }

  fetchTaskCategories () {
    let promise = $.Deferred()
    let url = '/api/task/category/all'

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
}

export default new TaskCategoryProvider()
