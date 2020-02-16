import $ from 'jquery'
import EventBaseView from './base'
import contestProvider from '../../providers/contest'
import identityProvider from '../../providers/identity'
import categoryProvider from '../../providers/category'
import postProvider from '../../providers/post'
import supervisorProvider from '../../providers/supervisor'
import taskProvider from '../../providers/task'
import taskCategoryProvider from '../../providers/task-category'
import teamProvider from '../../providers/team'
import teamTaskReviewProvider from '../../providers/team-task-review'
import teamTaskHitProvider from '../../providers/team-task-hit'

import taskValueProvider from '../../providers/task-value'
import taskRewardSchemeProvider from '../../providers/task-reward-scheme'
import taskFileProvider from '../../providers/task-file'

import remoteCheckerProvider from '../../providers/remote-checker'

class EventLiveView extends EventBaseView {
  constructor () {
    super()

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

    this.container = null
  }

  appendLog (eventName, eventData, createdAt) {
    const htmlString = super.renderEvent(eventName, eventData, createdAt)
    if (htmlString) {
      this.container.insertAdjacentHTML('beforeend', htmlString)
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

      this.container = document.getElementById('volgactf-qualifier-events')
    })
  }
}

export default new EventLiveView()
