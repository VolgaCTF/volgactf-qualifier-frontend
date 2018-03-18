import $ from 'jquery'
import _ from 'underscore'
import View from './base'
import contestProvider from '../providers/contest'
import identityProvider from '../providers/identity'
import moment from 'moment'
import categoryProvider from '../providers/category'
import postProvider from '../providers/post'
import supervisorProvider from '../providers/supervisor'
import taskProvider from '../providers/task'
import taskCategoryProvider from '../providers/task-category'
import teamProvider from '../providers/team'
import teamTaskReviewProvider from '../providers/team-task-review'
import teamTaskHitProvider from '../providers/team-task-hit'

import taskValueProvider from '../providers/task-value'
import taskRewardSchemeProvider from '../providers/task-reward-scheme'
import taskFileProvider from '../providers/task-file'

import remoteCheckerProvider from '../providers/remote-checker'

class EventsView extends View {
  constructor () {
    super()
    this.$main = null

    this.onUpdateContest = null
    this.onUpdateTeamScore = null
    this.onCreateTeamTaskHit = null

    this.onCreateTeamTaskHitAttempt = null

    this.onCreateTeamTaskReview = null

    this.onCreateCategory = null
    this.onUpdateCategory = null
    this.onDeleteCategory = null

    this.onCreatePost = null
    this.onUpdatePost = null
    this.onDeletePost = null

    this.onCreateSupervisor = null
    this.onDeleteSupervisor = null
    this.onUpdateSupervisorPassword = null
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
    this.onDisqualifyTeam = null
    this.onLoginTeam = null
    this.onLogoutTeam = null

    this.onCreateRemoteChecker = null
    this.onUpdateRemoteChecker = null
    this.onDeleteRemoteChecker = null

    this.onCreateTaskValue = null
    this.onUpdateTaskValue = null

    this.onCreateTaskRewardScheme = null
    this.onUpdateTaskRewardScheme = null

    this.onCreateTaskFile = null
    this.onDeleteTaskFile = null

    this.$eventsContainer = null
  }

  renderEvent (eventName, eventData, createdAt) {
    let $el = null
    switch (eventName) {
      case 'updateContest': {
        $el = $(window.themis.quals.templates.eventLogUpdateContest({
          _: _,
          moment: moment,
          createdAt: createdAt,
          contest: eventData
        }))
        break
      }
      case 'createCategory': {
        $el = $(window.themis.quals.templates.eventLogCreateCategory({
          _: _,
          moment: moment,
          createdAt: createdAt,
          category: eventData
        }))
        break
      }
      case 'updateCategory': {
        $el = $(window.themis.quals.templates.eventLogUpdateCategory({
          _: _,
          moment: moment,
          createdAt: createdAt,
          category: eventData
        }))
        break
      }
      case 'deleteCategory': {
        $el = $(window.themis.quals.templates.eventLogDeleteCategory({
          _: _,
          moment: moment,
          createdAt: createdAt,
          category: eventData
        }))
        break
      }
      case 'createPost': {
        $el = $(window.themis.quals.templates.eventLogCreatePost({
          _: _,
          moment: moment,
          createdAt: createdAt,
          post: eventData
        }))
        break
      }
      case 'updatePost': {
        $el = $(window.themis.quals.templates.eventLogUpdatePost({
          _: _,
          moment: moment,
          createdAt: createdAt,
          post: eventData
        }))
        break
      }
      case 'deletePost': {
        $el = $(window.themis.quals.templates.eventLogDeletePost({
          _: _,
          moment: moment,
          createdAt: createdAt,
          post: eventData
        }))
        break
      }
      case 'createSupervisor': {
        $el = $(window.themis.quals.templates.eventLogCreateSupervisor({
          _: _,
          moment: moment,
          createdAt: createdAt,
          supervisor: eventData
        }))
        break
      }
      case 'deleteSupervisor': {
        $el = $(window.themis.quals.templates.eventLogDeleteSupervisor({
          _: _,
          moment: moment,
          createdAt: createdAt,
          supervisor: eventData
        }))
        break
      }
      case 'updateSupervisorPassword': {
        $el = $(window.themis.quals.templates.eventLogUpdateSupervisorPassword({
          _: _,
          moment: moment,
          createdAt: createdAt,
          supervisor: eventData
        }))
        break
      }
      case 'loginSupervisor': {
        $el = $(window.themis.quals.templates.eventLogLoginSupervisor({
          _: _,
          moment: moment,
          createdAt: createdAt,
          supervisor: eventData
        }))
        break
      }
      case 'logoutSupervisor': {
        $el = $(window.themis.quals.templates.eventLogLogoutSupervisor({
          _: _,
          moment: moment,
          createdAt: createdAt,
          supervisor: eventData
        }))
        break
      }
      case 'createRemoteChecker': {
        $el = $(window.themis.quals.templates.eventLogCreateRemoteChecker({
          _: _,
          moment: moment,
          createdAt: createdAt,
          remoteChecker: eventData
        }))
        break
      }
      case 'updateRemoteChecker': {
        $el = $(window.themis.quals.templates.eventLogUpdateRemoteChecker({
          _: _,
          moment: moment,
          createdAt: createdAt,
          remoteChecker: eventData
        }))
        break
      }
      case 'deleteRemoteChecker': {
        $el = $(window.themis.quals.templates.eventLogDeleteRemoteChecker({
          _: _,
          moment: moment,
          createdAt: createdAt,
          remoteChecker: eventData
        }))
        break
      }
      case 'createTask': {
        $el = $(window.themis.quals.templates.eventLogCreateTask({
          _: _,
          moment: moment,
          createdAt: createdAt,
          task: eventData
        }))
        break
      }
      case 'updateTask': {
        $el = $(window.themis.quals.templates.eventLogUpdateTask({
          _: _,
          moment: moment,
          createdAt: createdAt,
          task: eventData
        }))
        break
      }
      case 'openTask': {
        $el = $(window.themis.quals.templates.eventLogOpenTask({
          _: _,
          moment: moment,
          createdAt: createdAt,
          task: eventData
        }))
        break
      }
      case 'closeTask': {
        $el = $(window.themis.quals.templates.eventLogCloseTask({
          _: _,
          moment: moment,
          createdAt: createdAt,
          task: eventData
        }))
        break
      }
      case 'createTaskCategory': {
        const task = _.findWhere(taskProvider.getTaskPreviews(), { id: eventData.taskId })
        const category = _.findWhere(categoryProvider.getCategories(), { id: eventData.categoryId })
        if (task && category) {
          $el = $(window.themis.quals.templates.eventLogCreateTaskCategory({
            _: _,
            moment: moment,
            createdAt: createdAt,
            task: task,
            category: category
          }))
        }
        break
      }
      case 'deleteTaskCategory': {
        const task = _.findWhere(taskProvider.getTaskPreviews(), { id: eventData.taskId })
        const category = _.findWhere(categoryProvider.getCategories(), { id: eventData.categoryId })
        if (task && category) {
          $el = $(window.themis.quals.templates.eventLogDeleteTaskCategory({
            _: _,
            moment: moment,
            createdAt: createdAt,
            task: task,
            category: category
          }))
        }
        break
      }
      case 'createTaskValue': {
        const task = _.findWhere(taskProvider.getTaskPreviews(), { id: eventData.taskId })
        if (task) {
          $el = $(window.themis.quals.templates.eventLogCreateTaskValue({
            _: _,
            moment: moment,
            createdAt: createdAt,
            task: task,
            taskValue: eventData
          }))
        }
        break
      }
      case 'updateTaskValue': {
        const task = _.findWhere(taskProvider.getTaskPreviews(), { id: eventData.taskId })
        if (task) {
          $el = $(window.themis.quals.templates.eventLogUpdateTaskValue({
            _: _,
            moment: moment,
            createdAt: createdAt,
            task: task,
            taskValue: eventData
          }))
        }
        break
      }
      case 'createTaskRewardScheme': {
        const task = _.findWhere(taskProvider.getTaskPreviews(), { id: eventData.taskId })
        if (task) {
          $el = $(window.themis.quals.templates.eventLogCreateTaskRewardScheme({
            _: _,
            moment: moment,
            createdAt: createdAt,
            task: task,
            taskRewardScheme: eventData
          }))
        }
        break
      }
      case 'updateTaskRewardScheme': {
        const task = _.findWhere(taskProvider.getTaskPreviews(), { id: eventData.taskId })
        if (task) {
          $el = $(window.themis.quals.templates.eventLogUpdateTaskRewardScheme({
            _: _,
            moment: moment,
            createdAt: createdAt,
            task: task,
            taskRewardScheme: eventData
          }))
        }
        break
      }
      case 'createTeam': {
        $el = $(window.themis.quals.templates.eventLogCreateTeam({
          _: _,
          moment: moment,
          createdAt: createdAt,
          team: eventData
        }))
        break
      }
      case 'updateTeamEmail': {
        $el = $(window.themis.quals.templates.eventLogUpdateTeamEmail({
          _: _,
          moment: moment,
          createdAt: createdAt,
          team: eventData
        }))
        break
      }
      case 'updateTeamProfile': {
        $el = $(window.themis.quals.templates.eventLogUpdateTeamProfile({
          _: _,
          moment: moment,
          createdAt: createdAt,
          team: eventData
        }))
        break
      }
      case 'updateTeamPassword': {
        $el = $(window.themis.quals.templates.eventLogUpdateTeamPassword({
          _: _,
          moment: moment,
          createdAt: createdAt,
          team: eventData
        }))
        break
      }
      case 'updateTeamLogo': {
        $el = $(window.themis.quals.templates.eventLogUpdateTeamLogo({
          _: _,
          moment: moment,
          createdAt: createdAt,
          team: eventData
        }))
        break
      }
      case 'qualifyTeam': {
        $el = $(window.themis.quals.templates.eventLogQualifyTeam({
          _: _,
          moment: moment,
          createdAt: createdAt,
          team: eventData
        }))
        break
      }
      case 'disqualifyTeam': {
        $el = $(window.themis.quals.templates.eventLogDisqualifyTeam({
          _: _,
          moment: moment,
          createdAt: createdAt,
          team: eventData
        }))
        break
      }
      case 'loginTeam': {
        $el = $(window.themis.quals.templates.eventLogLoginTeam({
          _: _,
          moment: moment,
          createdAt: createdAt,
          team: eventData
        }))
        break
      }
      case 'logoutTeam': {
        $el = $(window.themis.quals.templates.eventLogLogoutTeam({
          _: _,
          moment: moment,
          createdAt: createdAt,
          team: eventData
        }))
        break
      }
      case 'createTeamTaskHit': {
        const team = _.findWhere(teamProvider.getTeams(), { id: eventData.teamId })
        const task = _.findWhere(taskProvider.getTaskPreviews(), { id: eventData.taskId })
        if (team && task) {
          $el = $(window.themis.quals.templates.eventLogCreateTeamTaskHit({
            _: _,
            moment: moment,
            createdAt: createdAt,
            team: team,
            task: task,
            teamTaskHit: eventData
          }))
        }
        break
      }
      case 'createTeamTaskHitAttempt': {
        const team = _.findWhere(teamProvider.getTeams(), { id: eventData.teamId })
        const task = _.findWhere(taskProvider.getTaskPreviews(), { id: eventData.taskId })
        if (team && task) {
          $el = $(window.themis.quals.templates.eventLogCreateTeamTaskHitAttempt({
            _: _,
            moment: moment,
            createdAt: createdAt,
            team: team,
            task: task,
            teamTaskHitAttempt: eventData
          }))
        }
        break
      }
      case 'createTeamTaskReview': {
        const team = _.findWhere(teamProvider.getTeams(), { id: eventData.teamId })
        const task = _.findWhere(taskProvider.getTaskPreviews(), { id: eventData.taskId })
        if (team && task) {
          $el = $(window.themis.quals.templates.eventLogCreateTeamTaskReview({
            _: _,
            moment: moment,
            createdAt: createdAt,
            team: team,
            task: task,
            teamTaskReview: eventData
          }))
        }
        break
      }
      case 'createTaskFile': {
        const task = _.findWhere(taskProvider.getTaskPreviews(), { id: eventData.taskId })
        if (task) {
          $el = $(window.themis.quals.templates.eventLogCreateTaskFile({
            _: _,
            moment: moment,
            createdAt: createdAt,
            task: task,
            taskFile: eventData
          }))
        }
        break
      }
      case 'deleteTaskFile': {
        const task = _.findWhere(taskProvider.getTaskPreviews(), { id: eventData.taskId })
        if (task) {
          $el = $(window.themis.quals.templates.eventLogDeleteTaskFile({
            _: _,
            moment: moment,
            createdAt: createdAt,
            task: task,
            taskFile: eventData
          }))
        }
        break
      }
      default: {
        $el = $(window.themis.quals.templates.eventLogUnknown({
          _: _,
          moment: moment,
          eventName: eventName,
          createdAt: createdAt
        }))
        break
      }
    }

    return $el
  }

  appendLog (eventName, eventData, createdAt) {
    let $el = this.renderEvent(eventName, eventData, createdAt)
    if ($el && $el.length > 0) {
      this.$eventsContainer.append($el)
    }
  }

  subscribeToTeamTaskReviewEvents () {
    this.onCreateTeamTaskReview = (e, createdAt) => {
      this.appendLog('createTeamTaskReview', e, createdAt)
      return false
    }

    teamTaskReviewProvider.subscribe()
    teamTaskReviewProvider.on('createTeamTaskReview', this.onCreateTeamTaskReview)
  }

  subscribeToTeamTaskHitEvents () {
    teamTaskHitProvider.subscribe()

    this.onCreateTeamTaskHit = (e, createdAt) => {
      this.appendLog('createTeamTaskHit', e, createdAt)
      return false
    }

    teamTaskHitProvider.on('createTeamTaskHit', this.onCreateTeamTaskHit)

    this.onCreateTeamTaskHitAttempt = (e, createdAt) => {
      this.appendLog('createTeamTaskHitAttempt', e, createdAt)
      return false
    }

    teamTaskHitProvider.on('createTeamTaskHitAttempt', this.onCreateTeamTaskHitAttempt)
  }

  subscribeToContestEvents () {
    this.onUpdateContest = (e, createdAt) => {
      this.appendLog('updateContest', e, createdAt)
      return false
    }

    contestProvider.on('updateContest', this.onUpdateContest)
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

    this.onUpdateSupervisorPassword = (e, createdAt) => {
      this.appendLog('updateSupervisorPassword', e, createdAt)
      return false
    }

    supervisorProvider.on('updateSupervisorPassword', this.onUpdateSupervisorPassword)

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

    this.onDisqualifyTeam = (e, createdAt) => {
      this.appendLog('disqualifyTeam', e, createdAt)
      return false
    }

    teamProvider.on('disqualifyTeam', this.onDisqualifyTeam)

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

  subscribeToRemoteCheckerEvents () {
    remoteCheckerProvider.subscribe()

    this.onCreateRemoteChecker = (e, createdAt) => {
      this.appendLog('createRemoteChecker', e, createdAt)
      return false
    }

    remoteCheckerProvider.on('createRemoteChecker', this.onCreateRemoteChecker)

    this.onUpdateRemoteChecker = (e, createdAt) => {
      this.appendLog('updateRemoteChecker', e, createdAt)
      return false
    }

    remoteCheckerProvider.on('updateRemoteChecker', this.onUpdateRemoteChecker)

    this.onDeleteRemoteChecker = (e, createdAt) => {
      this.appendLog('deleteRemoteChecker', e, createdAt)
      return false
    }

    remoteCheckerProvider.on('deleteRemoteChecker', this.onDeleteRemoteChecker)
  }

  subscribeToTaskValueEvents () {
    taskValueProvider.subscribe(identityProvider.getIdentity())

    this.onCreateTaskValue = (e, createdAt) => {
      this.appendLog('createTaskValue', e, createdAt)
      return false
    }

    taskValueProvider.on('createTaskValue', this.onCreateTaskValue)

    this.onUpdateTaskValue = (e, createdAt) => {
      this.appendLog('updateTaskValue', e, createdAt)
      return false
    }

    taskValueProvider.on('updateTaskValue', this.onUpdateTaskValue)
  }

  subscribeToTaskRewardSchemeEvents () {
    taskRewardSchemeProvider.subscribe(identityProvider.getIdentity())

    this.onCreateTaskRewardScheme = (e, createdAt) => {
      this.appendLog('createTaskRewardScheme', e, createdAt)
      return false
    }

    taskRewardSchemeProvider.on('createTaskRewardScheme', this.onCreateTaskRewardScheme)

    this.onUpdateTaskRewardScheme = (e, createdAt) => {
      this.appendLog('updateTaskRewardScheme', e, createdAt)
      return false
    }

    taskRewardSchemeProvider.on('updateTaskRewardScheme', this.onUpdateTaskRewardScheme)
  }

  subscribeToTaskFileEvents () {
    taskFileProvider.subscribe()

    this.onCreateTaskFile = (e, createdAt) => {
      this.appendLog('createTaskFile', e, createdAt)
      return false
    }

    taskFileProvider.on('createTaskFile', this.onCreateTaskFile)

    this.onDeleteTaskFile = (e, createdAt) => {
      this.appendLog('deleteTaskFile', e, createdAt)
      return false
    }

    taskFileProvider.on('deleteTaskFile', this.onDeleteTaskFile)
  }

  present () {
    $
    .when(
      identityProvider.initIdentity(),
      contestProvider.initContest(),
      categoryProvider.initCategories(),
      postProvider.initPosts(),
      taskProvider.initTaskPreviews(),
      taskCategoryProvider.initTaskCategories(),
      taskValueProvider.initTaskValues(),
      taskRewardSchemeProvider.initTaskRewardSchemes(),
      teamProvider.initTeams(),
      remoteCheckerProvider.initRemoteCheckers()
    )
    .done((identity, contest) => {
      this.subscribeToContestEvents()
      this.subscribeToCategoryEvents()
      this.subscribeToPostEvents()
      this.subscribeToSupervisorEvents()
      this.subscribeToRemoteCheckerEvents()
      this.subscribeToTaskEvents()
      this.subscribeToTaskCategoryEvents()
      this.subscribeToTaskValueEvents()
      this.subscribeToTaskRewardSchemeEvents()
      this.subscribeToTeamEvents()
      this.subscribeToTeamTaskReviewEvents()
      this.subscribeToTeamTaskHitEvents()
      this.subscribeToTaskFileEvents()

      this.$eventsContainer = $('#themis-quals-events')
    })
  }
}

export default new EventsView()
