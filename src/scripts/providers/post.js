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

    const realtimeProvider = dataStore.getRealtimeProvider()

    this.onCreate = (e) => {
      const options = JSON.parse(e.data)
      const post = new PostModel(options)
      this.posts.push(post)
      this.trigger('createPost', [post, new Date(options.__metadataCreatedAt)])
    }

    realtimeProvider.addEventListener('createPost', this.onCreate)

    this.onUpdate = (e) => {
      const options = JSON.parse(e.data)
      const post = new PostModel(options)
      const ndx = _.findIndex(this.posts, { id: options.id })
      if (ndx > -1) {
        this.posts.splice(ndx, 1)
      }
      this.posts.push(post)
      this.trigger('updatePost', [post, new Date(options.__metadataCreatedAt)])
    }

    realtimeProvider.addEventListener('updatePost', this.onUpdate)

    this.onDelete = (e) => {
      const options = JSON.parse(e.data)
      const ndx = _.findIndex(this.posts, { id: options.id })
      if (ndx > -1) {
        this.posts.splice(ndx, 1)
        const post = new PostModel(options)
        this.trigger('deletePost', [post, new Date(options.__metadataCreatedAt)])
      }
    }

    realtimeProvider.addEventListener('deletePost', this.onDelete)
  }

  initPosts () {
    const promise = $.Deferred()
    this.posts = _.map(window.volgactf.qualifier.data.posts, function (options) {
      return new PostModel(options)
    })
    promise.resolve(this.posts)
    return promise
  }

  fetchPosts () {
    const promise = $.Deferred()
    const url = '/api/post/index'

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
    const promise = $.Deferred()
    const url = `/api/post/${id}/delete`

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
