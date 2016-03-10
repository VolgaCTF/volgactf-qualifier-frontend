import $ from 'jquery'
import _ from 'underscore'
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
import taskProvider from '../providers/task'
import taskCategoryProvider from '../providers/task-category'
import teamProvider from '../providers/team'

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
    this.onDeleteSupervisor = null
    this.onLoginSupervisor = null
    this.onLogoutSupervisor = null

    this.onCreateTask = null
    this.onUpdateTask = null
    this.onOpenTask = null
    this.onCloseTask = null

    this.onCreateTaskCategory = null
    this.onDeleteTaskCategory = null

    this.onCreateTeam = null
    this.onUpdateTeamEmail = null
    this.onUpdateTeamProfile = null
    this.onUpdateTeamPassword = null
    this.onUpdateTeamLogo = null
    this.onQualifyTeam = null
    this.onLoginTeam = null
    this.onLogoutTeam = null

    this.$eventsContainer = null
  }

  getTitle () {
    return `${metadataStore.getMetadata('event-title')} :: Events`
  }

  renderEvent (eventName, eventData, createdAt) {
    let $el = null
    let formatStr = 'MM/DD HH:mm:ss.SSS'
    switch (eventName) {
      case 'updateContest':
        $el = $(renderTemplate('event-log-update-contest', {
          createdAt: moment(createdAt).format(formatStr),
          contest: eventData
        }))
        break
      case 'createCategory':
        $el = $(renderTemplate('event-log-create-category', {
          createdAt: moment(createdAt).format(formatStr),
          category: eventData
        }))
        break
      case 'updateCategory':
        $el = $(renderTemplate('event-log-update-category', {
          createdAt: moment(createdAt).format(formatStr),
          category: eventData
        }))
        break
      case 'deleteCategory':
        $el = $(renderTemplate('event-log-delete-category', {
          createdAt: moment(createdAt).format(formatStr),
          category: eventData
        }))
        break
      case 'createPost':
        $el = $(renderTemplate('event-log-create-post', {
          createdAt: moment(createdAt).format(formatStr),
          post: eventData
        }))
        break
      case 'updatePost':
        $el = $(renderTemplate('event-log-update-post', {
          createdAt: moment(createdAt).format(formatStr),
          post: eventData
        }))
        break
      case 'deletePost':
        $el = $(renderTemplate('event-log-delete-post', {
          createdAt: moment(createdAt).format(formatStr),
          post: eventData
        }))
        break
      case 'createSupervisor':
        $el = $(renderTemplate('event-log-create-supervisor', {
          createdAt: moment(createdAt).format(formatStr),
          supervisor: eventData
        }))
        break
      case 'deleteSupervisor':
        $el = $(renderTemplate('event-log-delete-supervisor', {
          createdAt: moment(createdAt).format(formatStr),
          supervisor: eventData
        }))
        break
      case 'loginSupervisor':
        $el = $(renderTemplate('event-log-login-supervisor', {
          createdAt: moment(createdAt).format(formatStr),
          supervisor: eventData
        }))
        break
      case 'logoutSupervisor':
        $el = $(renderTemplate('event-log-logout-supervisor', {
          createdAt: moment(createdAt).format(formatStr),
          supervisor: eventData
        }))
        break
      case 'createTask':
        $el = $(renderTemplate('event-log-create-task', {
          createdAt: moment(createdAt).format(formatStr),
          task: eventData
        }))
        break
      case 'updateTask':
        $el = $(renderTemplate('event-log-update-task', {
          createdAt: moment(createdAt).format(formatStr),
          task: eventData
        }))
        break
      case 'openTask':
        $el = $(renderTemplate('event-log-open-task', {
          createdAt: moment(createdAt).format(formatStr),
          task: eventData
        }))
        break
      case 'closeTask':
        $el = $(renderTemplate('event-log-close-task', {
          createdAt: moment(createdAt).format(formatStr),
          task: eventData
        }))
        break
      case 'createTaskCategory': {
        let task = _.findWhere(taskProvider.getTaskPreviews(), { id: eventData.taskId })
        let category = _.findWhere(categoryProvider.getCategories(), { id: eventData.categoryId })
        $el = $(renderTemplate('event-log-create-task-category', {
          createdAt: moment(createdAt).format(formatStr),
          task: task,
          category: category
        }))
        break
      }
      case 'deleteTaskCategory': {
        let task = _.findWhere(taskProvider.getTaskPreviews(), { id: eventData.taskId })
        let category = _.findWhere(categoryProvider.getCategories(), { id: eventData.categoryId })
        $el = $(renderTemplate('event-log-delete-task-category', {
          createdAt: moment(createdAt).format(formatStr),
          task: task,
          category: category
        }))
        break
      }
      case 'createTeam': {
        $el = $(renderTemplate('event-log-create-team', {
          createdAt: moment(createdAt).format(formatStr),
          team: eventData
        }))
        break
      }
      case 'updateTeamEmail': {
        $el = $(renderTemplate('event-log-update-team-email', {
          createdAt: moment(createdAt).format(formatStr),
          team: eventData
        }))
        break
      }
      case 'updateTeamProfile': {
        $el = $(renderTemplate('event-log-update-team-profile', {
          createdAt: moment(createdAt).format(formatStr),
          team: eventData
        }))
        break
      }
      case 'updateTeamPassword': {
        $el = $(renderTemplate('event-log-update-team-password', {
          createdAt: moment(createdAt).format(formatStr),
          team: eventData
        }))
        break
      }
      case 'updateTeamLogo': {
        $el = $(renderTemplate('event-log-update-team-logo', {
          createdAt: moment(createdAt).format(formatStr),
          team: eventData
        }))
        break
      }
      case 'qualifyTeam': {
        $el = $(renderTemplate('event-log-qualify-team', {
          createdAt: moment(createdAt).format(formatStr),
          team: eventData
        }))
        break
      }
      case 'loginTeam': {
        $el = $(renderTemplate('event-log-login-team', {
          createdAt: moment(createdAt).format(formatStr),
          team: eventData
        }))
        break
      }
      case 'logoutTeam': {
        $el = $(renderTemplate('event-log-logout-team', {
          createdAt: moment(createdAt).format(formatStr),
          team: eventData
        }))
        break
      }
      default:
        $el = $(renderTemplate('event-log-unknown', {
          eventName: moment(createdAt).format(formatStr),
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
      // $el.get(0).scrollIntoView()
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

    this.onDeleteSupervisor = (e, createdAt) => {
      this.appendLog('deleteSupervisor', e, createdAt)
      return false
    }

    supervisorProvider.on('deleteSupervisor', this.onDeleteSupervisor)

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

    if (this.onDeleteSupervisor) {
      supervisorProvider.off('deleteSupervisor', this.onDeleteSupervisor)
      this.onDeleteSupervisor = null
    }

    if (this.onLoginSupervisor) {
      supervisorProvider.off('loginSupervisor', this.onLoginSupervisor)
      this.onLoginSupervisor = null
    }

    if (this.onLogoutSupervisor) {
      supervisorProvider.off('logoutSupervisor', this.onLogoutSupervisor)
      this.onLogoutSupervisor = null
    }

    supervisorProvider.unsubscribe()
  }

  subscribeToTaskEvents () {
    taskProvider.subscribe()

    this.onCreateTask = (e, createdAt) => {
      this.appendLog('createTask', e, createdAt)
      return false
    }

    taskProvider.on('createTask', this.onCreateTask)

    this.onUpdateTask = (e, createdAt) => {
      this.appendLog('updateTask', e, createdAt)
      return false
    }

    taskProvider.on('updateTask', this.onUpdateTask)

    this.onOpenTask = (e, createdAt) => {
      this.appendLog('openTask', e, createdAt)
      return false
    }

    taskProvider.on('openTask', this.onOpenTask)

    this.onCloseTask = (e, createdAt) => {
      this.appendLog('closeTask', e, createdAt)
      return false
    }

    taskProvider.on('closeTask', this.onCloseTask)
  }

  unsubscribeFromTaskEvents () {
    if (this.onCreateTask) {
      taskProvider.off('createTask', this.onCreateTask)
      this.onCreateTask = null
    }

    if (this.onUpdateTask) {
      taskProvider.off('updateTask', this.onUpdateTask)
      this.onUpdateTask = null
    }

    if (this.onOpenTask) {
      taskProvider.off('openTask', this.onOpenTask)
      this.onOpenTask = null
    }

    if (this.onCloseTask) {
      taskProvider.off('closeTask', this.onCloseTask)
      this.onCloseTask = null
    }

    taskProvider.unsubscribe()
  }

  subscribeToTaskCategoryEvents () {
    taskCategoryProvider.subscribe()

    this.onCreateTaskCategory = (e, createdAt) => {
      this.appendLog('createTaskCategory', e, createdAt)
      return false
    }

    taskCategoryProvider.on('createTaskCategory', this.onCreateTaskCategory)

    this.onDeleteTaskCategory = (e, createdAt) => {
      this.appendLog('deleteTaskCategory', e, createdAt)
      return false
    }

    taskCategoryProvider.on('deleteTaskCategory', this.onDeleteTaskCategory)
  }

  unsubscribeFromTaskCategoryEvents () {
    if (this.onCreateTaskCategory) {
      taskCategoryProvider.off('createTaskCategory', this.onCreateTaskCategory)
      this.onCreateTaskCategory = null
    }

    if (this.onDeleteTaskCategory) {
      taskCategoryProvider.off('deleteTaskCategory', this.onDeleteTaskCategory)
      this.onDeleteTaskCategory = null
    }

    taskCategoryProvider.unsubscribe()
  }

  subscribeToTeamEvents () {
    teamProvider.subscribe()

    this.onCreateTeam = (e, createdAt) => {
      this.appendLog('createTeam', e, createdAt)
      return false
    }

    teamProvider.on('createTeam', this.onCreateTeam)

    this.onUpdateTeamEmail = (e, createdAt) => {
      this.appendLog('updateTeamEmail', e, createdAt)
      return false
    }

    teamProvider.on('updateTeamEmail', this.onUpdateTeamEmail)

    this.onUpdateTeamProfile = (e, createdAt) => {
      this.appendLog('updateTeamProfile', e, createdAt)
      return false
    }

    teamProvider.on('updateTeamProfile', this.onUpdateTeamProfile)

    this.onUpdateTeamPassword = (e, createdAt) => {
      this.appendLog('updateTeamPassword', e, createdAt)
      return false
    }

    teamProvider.on('updateTeamPassword', this.onUpdateTeamPassword)

    this.onUpdateTeamLogo = (e, createdAt) => {
      this.appendLog('updateTeamLogo', e, createdAt)
      return false
    }

    teamProvider.on('updateTeamLogo', this.onUpdateTeamLogo)

    this.onQualifyTeam = (e, createdAt) => {
      this.appendLog('qualifyTeam', e, createdAt)
      return false
    }

    teamProvider.on('qualifyTeam', this.onQualifyTeam)

    this.onLoginTeam = (e, createdAt) => {
      this.appendLog('loginTeam', e, createdAt)
      return false
    }

    teamProvider.on('loginTeam', this.onLoginTeam)

    this.onLogoutTeam = (e, createdAt) => {
      this.appendLog('logoutTeam', e, createdAt)
      return false
    }

    teamProvider.on('logoutTeam', this.onLogoutTeam)
  }

  unsubscribeFromTeamEvents () {
    if (this.onCreateTeam) {
      teamProvider.off('createTeam', this.onCreateTeam)
      this.onCreateTeam = null
    }

    if (this.onUpdateTeamEmail) {
      teamProvider.off('updateTeamEmail', this.onUpdateTeamEmail)
      this.onUpdateTeamEmail = null
    }

    if (this.onUpdateTeamProfile) {
      teamProvider.off('updateTeamProfile', this.onUpdateTeamProfile)
      this.onUpdateTeamProfile = null
    }

    if (this.onUpdateTeamPassword) {
      teamProvider.off('updateTeamPassword', this.onUpdateTeamPassword)
      this.onUpdateTeamPassword = null
    }

    if (this.onUpdateTeamLogo) {
      teamProvider.off('updateTeamLogo', this.onUpdateTeamLogo)
      this.onUpdateTeamLogo = null
    }

    if (this.onQualifyTeam) {
      teamProvider.off('qualifyTeam', this.onQualifyTeam)
      this.onQualifyTeam = null
    }

    if (this.onLoginTeam) {
      teamProvider.off('loginTeam', this.onLoginTeam)
      this.onLoginTeam = null
    }

    if (this.onLogoutTeam) {
      teamProvider.off('logoutTeam', this.onLogoutTeam)
      this.onLogoutTeam = null
    }

    teamProvider.unsubscribe()
  }

  present () {
    this.$main = $('#main')
    this.$main.html(renderTemplate('loading-view'))

    $
      .when(
        identityProvider.fetchIdentity(),
        contestProvider.fetchContest(),
        categoryProvider.fetchCategories(),
        postProvider.fetchPosts(),
        taskProvider.fetchTaskPreviews(),
        taskCategoryProvider.fetchTaskCategories()
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
          this.subscribeToTaskEvents()
          this.subscribeToTaskCategoryEvents()
          this.subscribeToTeamEvents()

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
    this.unsubscribeFromTaskEvents()
    this.unsubscribeFromTaskCategoryEvents()
    this.unsubscribeFromTeamEvents()

    navigationBar.dismiss()
    statusBar.dismiss()

    if (dataStore.supportsRealtime()) {
      dataStore.disconnectRealtime()
    }
  }
}

export default new EventsView()
