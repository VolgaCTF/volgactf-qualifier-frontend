import $ from 'jquery'
import _ from 'underscore'
import View from './base'
import dataStore from '../data-store'
import navigationBar from '../new-navigation-bar'
import statusBar from '../new-status-bar'
import MarkdownRenderer from '../utils/markdown'
import moment from 'moment'
import postProvider from '../providers/post'
import contestProvider from '../providers/contest'
import identityProvider from '../providers/identity'
import URLSearchParams from 'url-search-params'
import 'jquery-form'
import 'parsley'

class NewsView extends View {
  constructor () {
    super()
    this.$main = null

    this.onCreatePost = null
    this.onUpdatePost = null
    this.onDeletePost = null
  }

  renderPosts () {
    const identity = identityProvider.getIdentity()
    const posts = postProvider.getPosts()
    this.$main.find('section').html(window.themis.quals.templates.postList({
      _: _,
      identity: identity,
      posts: posts,
      templates: window.themis.quals.templates,
      moment: moment,
      md: new MarkdownRenderer()
    }))
  }

  initDeletePostModal () {
    let $modal = $('#delete-post-modal')
    $modal.modal({ show: false })

    let $modalBody = $modal.find('.modal-body p.confirmation')
    let $submitError = $modal.find('.submit-error > p')
    let $submitButton = $modal.find('button[data-action="complete-delete-post"]')

    $modal.on('show.bs.modal', (e) => {
      let postId = parseInt($(e.relatedTarget).data('post-id'), 10)
      $modal.data('post-id', postId)
      let post = _.findWhere(postProvider.getPosts(), { id: postId })
      const template = _.template('You are about to delete the post <mark><%- title %></mark>. Continue?')
      $modalBody.html(template({ title: post.title }))
      $submitError.text('')
    })

    $submitButton.on('click', (e) => {
      let postId = $modal.data('post-id')
      $
        .when(postProvider.deletePost(postId, identityProvider.getIdentity().token))
        .done(() => {
          $modal.modal('hide')
          if (!dataStore.connectedRealtime()) {
            window.location.reload()
          }
        })
        .fail((err) => {
          $submitError.text(err)
        })
    })
  }

  initCreatePostModal () {
    let $modal = $('#create-post-modal')
    $modal.modal({ show: false })

    let $submitError = $modal.find('.submit-error > p')
    let $submitButton = $modal.find('button[data-action="complete-create-post"]')
    let $form = $modal.find('form')
    $form.parsley({
      errorClass: 'is-invalid',
      successClass: 'is-valid',
      classHandler: function (ParsleyField) {
        return ParsleyField.$element
      },
      errorsContainer: function (ParsleyField) {
        return ParsleyField.$element.parents('form-group')
      },
      errorsWrapper: '<div class="invalid-feedback">',
      errorTemplate: '<span></span>'
    })

    $submitButton.on('click', (e) => {
      $form.trigger('submit')
    })

    let $tabList = $('#create-post-tablist')
    let $tabData = $tabList.find('a[href="#create-post-data"]')
    let $tabPreview = $tabList.find('a[href="#create-post-preview"]')

    let $postTitle = $('#create-post-title')
    let $postDescription = $('#create-post-description')

    let $postPreview = $('#create-post-preview')

    $tabData.tab()
    $tabPreview.tab()

    $tabPreview.on('show.bs.tab', (e) => {
      $postPreview.html(window.themis.quals.templates.postSimplifiedPartial({
        _: _,
        moment: moment,
        md: new MarkdownRenderer(),
        title: $postTitle.val(),
        description: $postDescription.val(),
        updatedAt: new Date()
      }))
    })

    $modal.on('show.bs.modal', (e) => {
      $tabData.tab('show')
      $postTitle.val('')
      $postDescription.val('')
      $submitError.text('')
      $form.parsley().reset()
    })

    $modal.on('shown.bs.modal', (e) => {
      $postTitle.focus()
    })

    $form.on('submit', (e) => {
      e.preventDefault()
      $form.ajaxSubmit({
        beforeSubmit: () => {
          $submitError.text('')
          $submitButton.prop('disabled', true)
        },
        clearForm: true,
        dataType: 'json',
        headers: {
          'X-CSRF-Token': identityProvider.getIdentity().token
        },
        success: (responseText, textStatus, jqXHR) => {
          $modal.modal('hide')
          if (!dataStore.connectedRealtime()) {
            window.location.reload()
          }
        },
        error: (jqXHR, textStatus, errorThrown) => {
          if (jqXHR.responseJSON) {
            $submitError.text(jqXHR.responseJSON)
          } else {
            $submitError.text('Unknown error. Please try again later.')
          }
        },
        complete: () => {
          $submitButton.prop('disabled', false)
        }
      })
    })
  }

  initEditPostModal () {
    let $modal = $('#edit-post-modal')
    $modal.modal({ show: false })

    let $submitError = $modal.find('.submit-error > p')
    let $submitButton = $modal.find('button[data-action="complete-edit-post"]')
    let $form = $modal.find('form')
    $form.parsley({
      errorClass: 'is-invalid',
      successClass: 'is-valid',
      classHandler: function (ParsleyField) {
        return ParsleyField.$element
      },
      errorsContainer: function (ParsleyField) {
        return ParsleyField.$element.parents('form-group')
      },
      errorsWrapper: '<div class="invalid-feedback">',
      errorTemplate: '<span></span>'
    })

    $submitButton.on('click', (e) => {
      $form.trigger('submit')
    })

    let $tabList = $('#edit-post-tablist')
    let $tabData = $tabList.find('a[href="#edit-post-data"]')
    let $tabPreview = $tabList.find('a[href="#edit-post-preview"]')

    let $postTitle = $('#edit-post-title')
    let $postDescription = $('#edit-post-description')

    let $postPreview = $('#edit-post-preview')

    $tabData.tab()
    $tabPreview.tab()

    $tabPreview.on('show.bs.tab', (e) => {
      $postPreview.html(window.themis.quals.templates.postSimplifiedPartial({
        _: _,
        moment: moment,
        md: new MarkdownRenderer(),
        title: $postTitle.val(),
        description: $postDescription.val(),
        updatedAt: new Date()
      }))
    })

    $modal.on('show.bs.modal', (e) => {
      $tabData.tab('show')
      let postId = parseInt($(e.relatedTarget).data('post-id'), 10)
      let post = _.findWhere(postProvider.getPosts(), { id: postId })

      $form.attr('action', `/api/post/${postId}/update`)
      $postTitle.val(post.title)
      $postDescription.val(post.description)
      $submitError.text('')
      $form.parsley().reset()
    })

    $modal.on('shown.bs.modal', (e) => {
      $postTitle.focus()
    })

    $form.on('submit', (e) => {
      e.preventDefault()
      $form.ajaxSubmit({
        beforeSubmit: () => {
          $submitError.text('')
          $submitButton.prop('disabled', true)
        },
        clearForm: true,
        dataType: 'json',
        headers: {
          'X-CSRF-Token': identityProvider.getIdentity().token
        },
        success: (responseText, textStatus, jqXHR) => {
          $modal.modal('hide')
          if (!dataStore.connectedRealtime()) {
            window.location.reload()
          }
        },
        error: (jqXHR, textStatus, errorThrown) => {
          if (jqXHR.responseJSON) {
            $submitError.text(jqXHR.responseJSON)
          } else {
            $submitError.text('Unknown error. Please try again later.')
          }
        },
        complete: () => {
          $submitButton.prop('disabled', false)
        }
      })
    })
  }

  present () {
    this.$main = $('#main')

    $
    .when(
      identityProvider.initIdentity(),
      contestProvider.initContest(),
      postProvider.initPosts()
    )
    .done((identity) => {
      identityProvider.subscribe()

      navigationBar.present()
      statusBar.present()

      if (identity.isSupervisor()) {
        this.initCreatePostModal()
        this.initDeletePostModal()
        this.initEditPostModal()
      }

      let urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('action') === 'scrollTo' && urlParams.has('postId')) {
        let $el = $(`div.themis-post[data-id="${urlParams.get('postId')}"]`)
        if ($el.length > 0) {
          $el.get(0).scrollIntoView()
        }
      }

      this.onCreatePost = () => {
        this.renderPosts()
        return false
      }

      this.onUpdatePost = () => {
        this.renderPosts()
        return false
      }

      this.onDeletePost = () => {
        this.renderPosts()
        return false
      }

      postProvider.subscribe()
      postProvider.on('createPost', this.onCreatePost)
      postProvider.on('updatePost', this.onUpdatePost)
      postProvider.on('deletePost', this.onDeletePost)
    })
  }
}

export default new NewsView()
