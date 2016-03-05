import $ from 'jquery'
import _ from 'underscore'
import dataStore from '../data-store'
import EventEmitter from 'wolfy87-eventemitter'
import PostModel from '../models/post'

class PostProvider extends EventEmitter {
  constructor () {
    super()
    this.posts = []

    this.onCreate = null
    this.onUpdate = null
    this.onDelete = null
  }

  getPosts () {
    return this.posts
  }

  subscribe () {
    if (!dataStore.supportsRealtime()) {
      return
    }

    let realtimeProvider = dataStore.getRealtimeProvider()

    this.onCreate = (e) => {
      let options = JSON.parse(e.data)
      let post = new PostModel(options)
      this.posts.push(post)
      this.trigger('createPost', [post])
    }

    realtimeProvider.addEventListener('createPost', this.onCreate)

    this.onUpdate = (e) => {
      let options = JSON.parse(e.data)
      let post = new PostModel(options)
      let ndx = _.findIndex(this.posts, { id: options.id })
      if (ndx > -1) {
        this.posts.splice(ndx, 1)
      }
      this.posts.push(post)
      this.trigger('updatePost', [post])
    }

    realtimeProvider.addEventListener('updatePost', this.onUpdate)

    this.onDelete = (e) => {
      let options = JSON.parse(e.data)
      let ndx = _.findIndex(this.posts, { id: options.id })
      if (ndx > -1) {
        this.posts.splice(ndx, 1)
        this.trigger('deletePost', [options.id])
      }
    }

    realtimeProvider.addEventListener('deletePost', this.onDelete)
  }

  unsubscribe () {
    if (!dataStore.supportsRealtime()) {
      return
    }

    let realtimeProvider = dataStore.getRealtimeProvider()

    if (this.onCreate) {
      realtimeProvider.removeEventListener('createPost', this.onCreate)
      this.onCreate = null
    }

    if (this.onUpdate) {
      realtimeProvider.removeEventListener('updatePost', this.onUpdate)
      this.onUpdate = null
    }

    if (this.onDelete) {
      realtimeProvider.removeEventListener('deletePost', this.onDelete)
      this.onDelete = null
    }

    this.posts = []
  }

  fetchPosts () {
    let promise = $.Deferred()
    let url = '/api/post/index'

    $.ajax({
      url: url,
      dataType: 'json',
      success: (responseJSON, textStatus, jqXHR) => {
        this.posts = _.map(responseJSON, (options) => {
          return new PostModel(options)
        })

        promise.resolve(this.posts)
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

  deletePost (id, token) {
    let promise = $.Deferred()
    let url = `/api/post/${id}/delete`

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

export default new PostProvider()
