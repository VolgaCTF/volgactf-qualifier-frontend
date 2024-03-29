import $ from 'jquery'
import _ from 'underscore'
import dataStore from '../data-store'
import EventEmitter from 'wolfy87-eventemitter'
import TaskCategoryModel from '../models/task-category'
import identityProvider from './identity'

class TaskCategoryProvider extends EventEmitter {
  constructor () {
    super()
    this.taskCategories = []

    this.onCreate = null
    this.onDelete = null
    this.onReveal = null
  }

  getTaskCategories () {
    return this.taskCategories
  }

  subscribe () {
    if (!dataStore.supportsRealtime()) {
      return
    }

    const realtimeProvider = dataStore.getRealtimeProvider()

    this.onCreate = (e) => {
      const options = JSON.parse(e.data)
      const taskCategory = new TaskCategoryModel(options)
      this.taskCategories.push(taskCategory)
      this.trigger('createTaskCategory', [taskCategory, new Date(options.__metadataCreatedAt)])
    }

    realtimeProvider.addEventListener('createTaskCategory', this.onCreate)

    const identity = identityProvider.getIdentity()
    if (identity.isTeam() || identity.isGuest()) {
      this.onReveal = (e) => {
        const options = JSON.parse(e.data)
        const taskCategory = new TaskCategoryModel(options)
        this.taskCategories.push(taskCategory)
        this.trigger('revealTaskCategory', [taskCategory, new Date(options.__metadataCreatedAt)])
      }

      realtimeProvider.addEventListener('revealTaskCategory', this.onReveal)
    }

    this.onDelete = (e) => {
      const options = JSON.parse(e.data)
      const ndx = _.findIndex(this.taskCategories, { id: options.id })

      if (ndx > -1) {
        this.taskCategories.splice(ndx, 1)
        const taskCategory = new TaskCategoryModel(options)
        this.trigger('deleteTaskCategory', [taskCategory, new Date(options.__metadataCreatedAt)])
      }
    }

    realtimeProvider.addEventListener('deleteTaskCategory', this.onDelete)
  }

  initTaskCategories () {
    const promise = $.Deferred()
    this.taskCategories = _.map(window.volgactf.qualifier.data.taskCategories, function (options) {
      return new TaskCategoryModel(options)
    })
    promise.resolve(this.taskCategories)
    return promise
  }

  fetchTaskCategories () {
    const promise = $.Deferred()
    const url = '/api/task/category/index'

    $.ajax({
      url: url,
      dataType: 'json',
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

  fetchTaskCategoriesByTask (taskId) {
    const promise = $.Deferred()
    const url = `/api/task/${taskId}/category`

    $.ajax({
      url: url,
      dataType: 'json',
      success: (responseJSON, textStatus, jqXHR) => {
        const taskCategories = _.map(responseJSON, (options) => {
          return new TaskCategoryModel(options)
        })

        promise.resolve(taskCategories)
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
