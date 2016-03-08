import $ from 'jquery'
import View from './base'
import renderTemplate from '../utils/render-template'
import dataStore from '../data-store'
import navigationBar from '../navigation-bar'
import statusBar from '../status-bar'
import metadataStore from '../utils/metadata-store'
import contestProvider from '../providers/contest'
import identityProvider from '../providers/identity'
import moment from 'moment'
import categoryProvider from '../providers/category'
import postProvider from '../providers/post'
import supervisorProvider from '../providers/supervisor'

class EventsView extends View {
  constructor () {
    super(/^\/events$/)
    this.$main = null

    this.onUpdateContest = null

    this.onCreateCategory = null
    this.onUpdateCategory = null
    this.onDeleteCategory = null

    this.onCreatePost = null
    this.onUpdatePost = null
    this.onDeletePost = null

    this.onCreateSupervisor = null
    this.onRemoveSupervisor = null
    this.onLoginSupervisor = null
    this.onLogoutSupervisor = null

    this.$eventsContainer = null
  }

  getTitle () {
    return `${metadataStore.getMetadata('event-title')} :: Events`
  }

  renderEvent (eventName, eventData, createdAt) {
    let $el = null
    switch (eventName) {
      case 'updateContest':
        $el = $(renderTemplate('event-log-update-contest', {
          createdAt: moment(createdAt).format(),
          contest: eventData
        }))
        break
      case 'createCategory':
        $el = $(renderTemplate('event-log-create-category', {
          createdAt: moment(createdAt).format(),
          category: eventData
        }))
        break
      case 'updateCategory':
        $el = $(renderTemplate('event-log-update-category', {
          createdAt: moment(createdAt).format(),
          category: eventData
        }))
        break
      case 'deleteCategory':
        $el = $(renderTemplate('event-log-delete-category', {
          createdAt: moment(createdAt).format(),
          category: eventData
        }))
        break
      case 'createPost':
        $el = $(renderTemplate('event-log-create-post', {
          createdAt: moment(createdAt).format(),
          post: eventData
        }))
        break
      case 'updatePost':
        $el = $(renderTemplate('event-log-update-post', {
          createdAt: moment(createdAt).format(),
          post: eventData
        }))
        break
      case 'deletePost':
        $el = $(renderTemplate('event-log-delete-post', {
          createdAt: moment(createdAt).format(),
          post: eventData
        }))
        break
      case 'createSupervisor':
        $el = $(renderTemplate('event-log-create-supervisor', {
          createdAt: moment(createdAt).format(),
          supervisor: eventData
        }))
        break
      case 'removeSupervisor':
        $el = $(renderTemplate('event-log-remove-supervisor', {
          createdAt: moment(createdAt).format(),
          supervisor: eventData
        }))
        break
      case 'loginSupervisor':
        $el = $(renderTemplate('event-log-login-supervisor', {
          createdAt: moment(createdAt).format(),
          supervisor: eventData
        }))
        break
      case 'logoutSupervisor':
        $el = $(renderTemplate('event-log-logout-supervisor', {
          createdAt: moment(createdAt).format(),
          supervisor: eventData
        }))
        break
      default:
        $el = $(renderTemplate('event-log-unknown', {
          eventName: eventName,
          createdAt: moment(createdAt).format()
        }))
        break
    }

    return $el
  }

  appendLog (eventName, eventData, createdAt) {
    let $el = this.renderEvent(eventName, eventData, createdAt)
    if ($el && $el.length > 0) {
      this.$eventsContainer.append($el)
    }
  }

  subscribeToCategoryEvents () {
    categoryProvider.subscribe()

    this.onCreateCategory = (e, createdAt) => {
      this.appendLog('createCategory', e, createdAt)
      return false
    }

    categoryProvider.on('createCategory', this.onCreateCategory)

    this.onUpdateCategory = (e, createdAt) => {
      this.appendLog('updateCategory', e, createdAt)
      return false
    }

    categoryProvider.on('updateCategory', this.onUpdateCategory)

    this.onDeleteCategory = (e, createdAt) => {
      this.appendLog('deleteCategory', e, createdAt)
      return false
    }

    categoryProvider.on('deleteCategory', this.onDeleteCategory)
  }

  unsubscribeFromCategoryEvents () {
    if (this.onCreateCategory) {
      categoryProvider.off('createCategory', this.onCreateCategory)
      this.onCreateCategory = null
    }

    if (this.onUpdateCategory) {
      categoryProvider.off('updateCategory', this.onUpdateCategory)
      this.onUpdateCategory = null
    }

    if (this.onDeleteCategory) {
      categoryProvider.off('deleteCategory', this.onDeleteCategory)
      this.onDeleteCategory = null
    }

    categoryProvider.unsubscribe()
  }

  subscribeToPostEvents () {
    postProvider.subscribe()

    this.onCreatePost = (e, createdAt) => {
      this.appendLog('createPost', e, createdAt)
      return false
    }

    postProvider.on('createPost', this.onCreatePost)

    this.onUpdatePost = (e, createdAt) => {
      this.appendLog('updatePost', e, createdAt)
      return false
    }

    postProvider.on('updatePost', this.onUpdatePost)

    this.onDeletePost = (e, createdAt) => {
      this.appendLog('deletePost', e, createdAt)
      return false
    }

    postProvider.on('deletePost', this.onDeletePost)
  }

  unsubscribeFromPostEvents () {
    if (this.onCreatePost) {
      postProvider.off('createPost', this.onCreatePost)
      this.onCreatePost = null
    }

    if (this.onUpdatePost) {
      postProvider.off('updatePost', this.onUpdatePost)
      this.onUpdatePost = null
    }

    if (this.onDeletePost) {
      postProvider.off('deletePost', this.onDeletePost)
      this.onDeletePost = null
    }

    postProvider.unsubscribe()
  }

  subscribeToSupervisorEvents () {
    supervisorProvider.subscribe()

    this.onCreateSupervisor = (e, createdAt) => {
      this.appendLog('createSupervisor', e, createdAt)
      return false
    }

    supervisorProvider.on('createSupervisor', this.onCreateSupervisor)

    this.onRemoveSupervisor = (e, createdAt) => {
      this.appendLog('removeSupervisor', e, createdAt)
      return false
    }

    supervisorProvider.on('removeSupervisor', this.onRemoveSupervisor)

    this.onLoginSupervisor = (e, createdAt) => {
      this.appendLog('loginSupervisor', e, createdAt)
      return false
    }

    supervisorProvider.on('loginSupervisor', this.onLoginSupervisor)

    this.onLogoutSupervisor = (e, createdAt) => {
      this.appendLog('logoutSupervisor', e, createdAt)
      return false
    }

    supervisorProvider.on('logoutSupervisor', this.onLogoutSupervisor)
  }

  unsubscribeFromSupervisorEvents () {
    if (this.onCreateSupervisor) {
      supervisorProvider.off('createSupervisor', this.onCreateSupervisor)
      this.onCreateSupervisor = null
    }

    if (this.onRemoveSupervisor) {
      supervisorProvider.off('removeSupervisor', this.onRemoveSupervisor)
      this.onRemoveSupervisor = null
    }

    if (this.onLoginSupervisor) {
      supervisorProvider.off('loginSupervisor', this.onLoginSupervisor)
      this.onLoginSupervisor = null
    }

    if (this.onLogoutSupervisor) {
      supervisorProvider.off('logoutSupervisor', this.onLogoutSupervisor)
      this.onLogoutSupervisor = null
    }

    postProvider.unsubscribe()
  }

  present () {
    this.$main = $('#main')
    this.$main.html(renderTemplate('loading-view'))

    $
      .when(
        identityProvider.fetchIdentity(),
        contestProvider.fetchContest(),
        categoryProvider.fetchCategories(),
        postProvider.fetchPosts()
      )
      .done((identity, contest) => {
        if (identity.isSupervisor()) {
          if (dataStore.supportsRealtime()) {
            dataStore.connectRealtime()
          }

          identityProvider.subscribe()

          navigationBar.present({ active: 'events' })
          statusBar.present()

          this.onUpdateContest = (e, createdAt) => {
            this.appendLog('updateContest', e, createdAt)
            return false
          }

          contestProvider.on('updateContest', this.onUpdateContest)

          this.subscribeToCategoryEvents()
          this.subscribeToPostEvents()
          this.subscribeToSupervisorEvents()

          this.$main.html(renderTemplate('events-view'))
          this.$eventsContainer = $('#themis-events')
        } else {
          this.$main.html(renderTemplate('access-forbidden-view', {
            urlPath: window.location.pathname
          }))
        }
      })
      .fail((err) => {
        console.error(err)
        navigationBar.present()
        this.$main.html(renderTemplate('internal-error-view'))
      })
  }

  dismiss () {
    identityProvider.unsubscribe()

    this.$main.empty()
    this.$main = null

    if (this.onUpdateContest) {
      contestProvider.off('updateContest', this.onUpdateContest)
      this.onUpdateContest = null
    }

    this.unsubscribeFromCategoryEvents()
    this.unsubscribeFromPostEvents()
    this.unsubscribeFromSupervisorEvents()

    navigationBar.dismiss()
    statusBar.dismiss()

    if (dataStore.supportsRealtime()) {
      dataStore.disconnectRealtime()
    }
  }
}

export default new EventsView()
