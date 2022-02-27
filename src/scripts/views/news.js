import $ from 'jquery'
import _ from 'underscore'
import View from './base'
import dataStore from '../data-store'
import MarkdownRenderer from '../utils/markdown'
import moment from 'moment'
import postProvider from '../providers/post'
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
    this.$main.find('section').html(window.volgactf.qualifier.templates.postList({
      _: _,
      identity: identity,
      posts: posts,
      templates: window.volgactf.qualifier.templates,
      moment: moment,
      md: new MarkdownRenderer()
    }))
  }

  initDeletePostModal () {
    const $modal = $('#delete-post-modal')
    $modal.modal({ show: false })

    const $modalBody = $modal.find('.modal-body p.confirmation')
    const $submitError = $modal.find('.submit-error > p')
    const $submitButton = $modal.find('button[data-action="complete-delete-post"]')

    $modal.on('show.bs.modal', (e) => {
      const postId = parseInt($(e.relatedTarget).data('post-id'), 10)
      $modal.data('post-id', postId)
      const post = _.findWhere(postProvider.getPosts(), { id: postId })
      const template = _.template('You are about to delete the post <mark><%- title %></mark>. Continue?')
      $modalBody.html(template({ title: post.title }))
      $submitError.text('')
    })

    $submitButton.on('click', (e) => {
      const postId = $modal.data('post-id')
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
    const $modal = $('#create-post-modal')
    $modal.modal({ show: false })

    const $submitError = $modal.find('.submit-error > p')
    const $submitButton = $modal.find('button[data-action="complete-create-post"]')
    const $form = $modal.find('form')
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

    const $tabList = $('#create-post-tablist')
    const $tabData = $tabList.find('a[href="#create-post-data"]')
    const $tabPreview = $tabList.find('a[href="#create-post-preview"]')

    const $postTitle = $('#create-post-title')
    const $postDescription = $('#create-post-description')

    const $postPreview = $('#create-post-preview')

    $tabData.tab()
    $tabPreview.tab()

    $tabPreview.on('show.bs.tab', (e) => {
      $postPreview.html(window.volgactf.qualifier.templates.postSimplifiedPartial({
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
    const $modal = $('#edit-post-modal')
    $modal.modal({ show: false })

    const $submitError = $modal.find('.submit-error > p')
    const $submitButton = $modal.find('button[data-action="complete-edit-post"]')
    const $form = $modal.find('form')
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

    const $tabList = $('#edit-post-tablist')
    const $tabData = $tabList.find('a[href="#edit-post-data"]')
    const $tabPreview = $tabList.find('a[href="#edit-post-preview"]')

    const $postTitle = $('#edit-post-title')
    const $postDescription = $('#edit-post-description')

    const $postPreview = $('#edit-post-preview')

    $tabData.tab()
    $tabPreview.tab()

    $tabPreview.on('show.bs.tab', (e) => {
      $postPreview.html(window.volgactf.qualifier.templates.postSimplifiedPartial({
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
      const postId = parseInt($(e.relatedTarget).data('post-id'), 10)
      const post = _.findWhere(postProvider.getPosts(), { id: postId })

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
        postProvider.initPosts()
      )
      .done(() => {
        const identity = identityProvider.getIdentity()

        if (identity.isSupervisor()) {
          this.initCreatePostModal()
          this.initDeletePostModal()
          this.initEditPostModal()
        }

        const urlParams = new URLSearchParams(window.location.search)
        if (urlParams.get('action') === 'scrollTo' && urlParams.has('postId')) {
          const $el = $(`div.volgactf-post[data-id="${urlParams.get('postId')}"]`)
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
