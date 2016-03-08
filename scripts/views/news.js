import $ from 'jquery'
import _ from 'underscore'
import View from './base'
import renderTemplate from '../utils/render-template'
import dataStore from '../data-store'
import navigationBar from '../navigation-bar'
import statusBar from '../status-bar'
import metadataStore from '../utils/metadata-store'
import MarkdownRenderer from '../utils/markdown'
import moment from 'moment'
import postProvider from '../providers/post'
import contestProvider from '../providers/contest'
import identityProvider from '../providers/identity'
import 'jquery.form'
import 'parsley'

class NewsView extends View {
  constructor () {
    super(/^\/news$/)
    this.$main = null

    this.onCreatePost = null
    this.onUpdatePost = null
    this.onDeletePost = null
  }

  getTitle () {
    return `${metadataStore.getMetadata('event-title')} :: News`
  }

  renderPosts () {
    let posts = postProvider.getPosts()
    let $section = this.$main.find('section')

    if (posts.length === 0) {
      $section.empty()
      $section.html($('<p></p>').addClass('lead').text('No posts have been published yet.'))
    } else {
      $section.empty()
      let md = new MarkdownRenderer()
      let sortedPosts = _.sortBy(posts, 'createdAt').reverse()
      let manageable = identityProvider.getIdentity().isSupervisor()
      for (let post of sortedPosts) {
        let options = {
          id: post.id,
          title: post.title,
          description: md.render(post.description),
          updatedAt: moment(post.updatedAt).format('lll'),
          manageable: manageable
        }

        $section.append($(renderTemplate('post-partial', options)))
      }
    }
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
      $modalBody.html(renderTemplate('delete-post-confirmation', { title: post.title }))
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
    $form.parsley()

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
      let md = new MarkdownRenderer()
      let options = {
        title: $postTitle.val(),
        description: md.render($postDescription.val()),
        updatedAt: moment(new Date()).format('lll')
      }

      $postPreview.html(renderTemplate('post-simplified-partial', options))
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
    $form.parsley()

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
      let md = new MarkdownRenderer()
      let options = {
        title: $postTitle.val(),
        description: md.render($postDescription.val()),
        updatedAt: moment(new Date()).format('lll')
      }

      $postPreview.html(renderTemplate('post-simplified-partial', options))
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
    this.$main.html(renderTemplate('loading-view'))

    $
      .when(identityProvider.fetchIdentity())
      .done((identity) => {
        let promise = null
        if (identity.isTeam()) {
          promise = $.when(contestProvider.fetchContest(), postProvider.fetchPosts(), contestProvider.fetchTeamScores())
        } else {
          promise = $.when(contestProvider.fetchContest(), postProvider.fetchPosts())
        }

        promise
          .done((contest) => {
            identityProvider.subscribe()
            if (dataStore.supportsRealtime()) {
              dataStore.connectRealtime()
            }

            navigationBar.present({ active: 'news' })
            statusBar.present()

            this.$main.html(renderTemplate('news-view', { identity: identity }))

            if (identity.isSupervisor()) {
              this.initCreatePostModal()
              this.initDeletePostModal()
              this.initEditPostModal()
            }

            this.renderPosts()

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
          .fail((err) => {
            console.error(err)
            navigationBar.present()
            this.$main.html(renderTemplate('internal-error-view'))
          })
      })
      .fail((err) => {
        console.error(err)
        navigationBar.present()
        this.$main.html(renderTemplate('internal-error-view'))
      })
  }

  dismiss () {
    identityProvider.unsubscribe()

    if (this.onCreatePost) {
      postProvider.off('createPost', this.onCreatePost)
      this.onCreatePost = null
    }

    if (this.onDeletePost) {
      postProvider.off('deletePost', this.onDeletePost)
      this.onDeletePost = null
    }

    if (this.onUpdatePost) {
      postProvider.off('updatePost', this.onUpdatePost)
      this.onUpdatePost = null
    }

    postProvider.unsubscribe()

    this.$main.empty()
    this.$main = null
    navigationBar.dismiss()
    statusBar.dismiss()

    if (dataStore.supportsRealtime()) {
      dataStore.disconnectRealtime()
    }
  }
}

export default new NewsView()
