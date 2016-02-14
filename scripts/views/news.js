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
    this.onRemovePost = null
  }

  getTitle () {
    return `${metadataStore.getMetadata('event-title')} :: News`
  }

  renderPosts () {
    let posts = postProvider.getPosts()
    let $section = this.$main.find('section')

    if (posts.length === 0) {
      $section.empty()
      $section.html($('<p></p>').addClass('lead').text('No news yet.'))
    } else {
      $section.empty()
      let md = new MarkdownRenderer()
      let sortedPosts = _.sortBy(posts, 'createdAt').reverse()
      let manageable = _.contains(['admin', 'manager'], identityProvider.getIdentity().role)
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

  initRemovePostModal () {
    let $removePostModal = $('#remove-post-modal')
    $removePostModal.modal({ show: false })

    let $removePostModalBody = $removePostModal.find('.modal-body p.confirmation')
    let $removePostSubmitError = $removePostModal.find('.submit-error > p')
    let $removePostSubmitButton = $removePostModal.find('button[data-action="complete-remove-post"]')

    $removePostModal.on('show.bs.modal', (e) => {
      let postId = parseInt($(e.relatedTarget).data('post-id'), 10)
      $removePostModal.data('post-id', postId)
      let post = _.findWhere(postProvider.getPosts(), { id: postId })
      $removePostModalBody.html(renderTemplate('remove-post-confirmation', { title: post.title }))
      $removePostSubmitError.text('')
    })

    $removePostSubmitButton.on('click', (e) => {
      let postId = $removePostModal.data('post-id')
      $
        .when(postProvider.removePost(postId, identityProvider.getIdentity().token))
        .done(() => {
          $removePostModal.modal('hide')
          if (!dataStore.connectedRealtime()) {
            window.location.reload()
          }
        })
        .fail((err) => {
          $removePostSubmitError.text(err)
        })
    })
  }

  initCreatePostModal () {
    let $createPostModal = $('#create-post-modal')
    $createPostModal.modal({ show: false })

    let $createPostSubmitError = $createPostModal.find('.submit-error > p')
    let $createPostSubmitButton = $createPostModal.find('button[data-action="complete-create-post"]')
    let $createPostForm = $createPostModal.find('form')
    $createPostForm.parsley()

    $createPostSubmitButton.on('click', (e) => {
      $createPostForm.trigger('submit')
    })

    let $createPostTablist = $('#create-post-tablist')
    let $createPostTabData = $createPostTablist.find('a[href="#create-post-data"]')
    let $createPostTabPreview = $createPostTablist.find('a[href="#create-post-preview"]')

    let $createPostTitle = $('#create-post-title')
    let $createPostDescription = $('#create-post-description')

    let $createPostPreview = $('#create-post-preview')

    $createPostTabData.tab()
    $createPostTabPreview.tab()

    $createPostTabPreview.on('show.bs.tab', (e) => {
      let md = new MarkdownRenderer()
      let options = {
        title: $createPostTitle.val(),
        description: md.render($createPostDescription.val()),
        updatedAt: moment(new Date()).format('lll')
      }

      $createPostPreview.html(renderTemplate('post-simplified-partial', options))
    })

    $createPostModal.on('show.bs.modal', (e) => {
      $createPostTabData.tab('show')
      $createPostTitle.val('')
      $createPostDescription.val('')
      $createPostSubmitError.text('')
      $createPostForm.parsley().reset()
    })

    $createPostModal.on('shown.bs.modal', (e) => {
      $createPostTitle.focus()
    })

    $createPostForm.on('submit', (e) => {
      e.preventDefault()
      $createPostForm.ajaxSubmit({
        beforeSubmit: () => {
          $createPostSubmitError.text('')
          $createPostSubmitButton.prop('disabled', true)
        },
        clearForm: true,
        dataType: 'json',
        xhrFields: {
          withCredentials: true
        },
        headers: {
          'X-CSRF-Token': identityProvider.getIdentity().token
        },
        success: (responseText, textStatus, jqXHR) => {
          $createPostModal.modal('hide')
          if (!dataStore.connectedRealtime()) {
            window.location.reload()
          }
        },
        error: (jqXHR, textStatus, errorThrown) => {
          if (jqXHR.responseJSON) {
            $createPostSubmitError.text(jqXHR.responseJSON)
          } else {
            $createPostSubmitError.text('Unknown error. Please try again later.')
          }
        },
        complete: () => {
          $createPostSubmitButton.prop('disabled', false)
        }
      })
    })
  }

  initEditPostModal () {
    let $editPostModal = $('#edit-post-modal')
    $editPostModal.modal({ show: false })

    let $editPostSubmitError = $editPostModal.find('.submit-error > p')
    let $editPostSubmitButton = $editPostModal.find('button[data-action="complete-edit-post"]')
    let $editPostForm = $editPostModal.find('form')
    $editPostForm.parsley()

    $editPostSubmitButton.on('click', (e) => {
      $editPostForm.trigger('submit')
    })

    let $editPostTablist = $('#edit-post-tablist')
    let $editPostTabData = $editPostTablist.find('a[href="#edit-post-data"]')
    let $editPostTabPreview = $editPostTablist.find('a[href="#edit-post-preview"]')

    let $editPostTitle = $('#edit-post-title')
    let $editPostDescription = $('#edit-post-description')

    let $editPostPreview = $('#edit-post-preview')

    $editPostTabData.tab()
    $editPostTabPreview.tab()

    $editPostTabPreview.on('show.bs.tab', (e) => {
      let md = new MarkdownRenderer()
      let options = {
        title: $editPostTitle.val(),
        description: md.render($editPostDescription.val()),
        updatedAt: moment(new Date()).format('lll')
      }

      $editPostPreview.html(renderTemplate('post-simplified-partial', options))
    })

    $editPostModal.on('show.bs.modal', (e) => {
      $editPostTabData.tab('show')
      let postId = parseInt($(e.relatedTarget).data('post-id'), 10)
      let post = _.findWhere(postProvider.getPosts(), { id: postId })

      $editPostForm.attr('action', `/api/post/${postId}/update`)
      $editPostTitle.val(post.title)
      $editPostDescription.val(post.description)
      $editPostSubmitError.text('')
      $editPostForm.parsley().reset()
    })

    $editPostModal.on('shown.bs.modal', (e) => {
      $editPostTitle.focus()
    })

    $editPostForm.on('submit', (e) => {
      e.preventDefault()
      $editPostForm.ajaxSubmit({
        beforeSubmit: () => {
          $editPostSubmitError.text('')
          $editPostSubmitButton.prop('disabled', true)
        },
        clearForm: true,
        dataType: 'json',
        xhrFields: {
          withCredentials: true
        },
        headers: {
          'X-CSRF-Token': identityProvider.getIdentity().token
        },
        success: (responseText, textStatus, jqXHR) => {
          $editPostModal.modal('hide')
          if (!dataStore.connectedRealtime()) {
            window.location.reload()
          }
        },
        error: (jqXHR, textStatus, errorThrown) => {
          if (jqXHR.responseJSON) {
            $editPostSubmitError.text(jqXHR.responseJSON)
          } else {
            $editPostSubmitError.text('Unknown error. Please try again later.')
          }
        },
        complete: () => {
          $editPostSubmitButton.prop('disabled', false)
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
        if (identity.role === 'team') {
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

            if (_.contains(['admin', 'manager'], identity.role)) {
              this.initCreatePostModal()
              this.initRemovePostModal()
              this.initEditPostModal()
            }

            this.renderPosts()

            this.onCreatePost = (post) => {
              this.renderPosts()
              return false
            }

            this.onUpdatePost = (post) => {
              this.renderPosts()
              return false
            }

            this.onRemovePost = (postId) => {
              this.renderPosts()
              return false
            }

            postProvider.subscribe()
            postProvider.on('createPost', this.onCreatePost)
            postProvider.on('updatePost', this.onUpdatePost)
            postProvider.on('removePost', this.onRemovePost)
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

    if (this.onRemovePost) {
      postProvider.off('removePost', this.onRemovePost)
      this.onRemovePost = null
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
