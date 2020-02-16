import _ from 'underscore'
import View from '../base'
import moment from 'moment'
import categoryProvider from '../../providers/category'
import taskProvider from '../../providers/task'
import teamProvider from '../../providers/team'

class EventBaseView extends View {
  renderEvent (eventName, eventData, createdAt) {
    let r = null
    switch (eventName) {
      case 'updateContest': {
        r = window.volgactf.qualifier.templates.eventLogUpdateContest({
          _: _,
          moment: moment,
          createdAt: createdAt,
          contest: eventData
        })
        break
      }
      case 'createCategory': {
        r = window.volgactf.qualifier.templates.eventLogCreateCategory({
          _: _,
          moment: moment,
          createdAt: createdAt,
          category: eventData
        })
        break
      }
      case 'updateCategory': {
        r = window.volgactf.qualifier.templates.eventLogUpdateCategory({
          _: _,
          moment: moment,
          createdAt: createdAt,
          category: eventData
        })
        break
      }
      case 'deleteCategory': {
        r = window.volgactf.qualifier.templates.eventLogDeleteCategory({
          _: _,
          moment: moment,
          createdAt: createdAt,
          category: eventData
        })
        break
      }
      case 'createPost': {
        r = window.volgactf.qualifier.templates.eventLogCreatePost({
          _: _,
          moment: moment,
          createdAt: createdAt,
          post: eventData
        })
        break
      }
      case 'updatePost': {
        r = window.volgactf.qualifier.templates.eventLogUpdatePost({
          _: _,
          moment: moment,
          createdAt: createdAt,
          post: eventData
        })
        break
      }
      case 'deletePost': {
        r = window.volgactf.qualifier.templates.eventLogDeletePost({
          _: _,
          moment: moment,
          createdAt: createdAt,
          post: eventData
        })
        break
      }
      case 'createSupervisor': {
        r = window.volgactf.qualifier.templates.eventLogCreateSupervisor({
          _: _,
          moment: moment,
          createdAt: createdAt,
          supervisor: eventData
        })
        break
      }
      case 'deleteSupervisor': {
        r = window.volgactf.qualifier.templates.eventLogDeleteSupervisor({
          _: _,
          moment: moment,
          createdAt: createdAt,
          supervisor: eventData
        })
        break
      }
      case 'updateSupervisorPassword': {
        r = window.volgactf.qualifier.templates.eventLogUpdateSupervisorPassword({
          _: _,
          moment: moment,
          createdAt: createdAt,
          supervisor: eventData
        })
        break
      }
      case 'loginSupervisor': {
        r = window.volgactf.qualifier.templates.eventLogLoginSupervisor({
          _: _,
          moment: moment,
          createdAt: createdAt,
          supervisor: eventData.supervisor,
          geoIP: eventData.geoIP
        })
        break
      }
      case 'logoutSupervisor': {
        r = window.volgactf.qualifier.templates.eventLogLogoutSupervisor({
          _: _,
          moment: moment,
          createdAt: createdAt,
          supervisor: eventData
        })
        break
      }
      case 'createRemoteChecker': {
        r = window.volgactf.qualifier.templates.eventLogCreateRemoteChecker({
          _: _,
          moment: moment,
          createdAt: createdAt,
          remoteChecker: eventData
        })
        break
      }
      case 'updateRemoteChecker': {
        r = window.volgactf.qualifier.templates.eventLogUpdateRemoteChecker({
          _: _,
          moment: moment,
          createdAt: createdAt,
          remoteChecker: eventData
        })
        break
      }
      case 'deleteRemoteChecker': {
        r = window.volgactf.qualifier.templates.eventLogDeleteRemoteChecker({
          _: _,
          moment: moment,
          createdAt: createdAt,
          remoteChecker: eventData
        })
        break
      }
      case 'createTask': {
        r = window.volgactf.qualifier.templates.eventLogCreateTask({
          _: _,
          moment: moment,
          createdAt: createdAt,
          task: eventData
        })
        break
      }
      case 'updateTask': {
        r = window.volgactf.qualifier.templates.eventLogUpdateTask({
          _: _,
          moment: moment,
          createdAt: createdAt,
          task: eventData
        })
        break
      }
      case 'openTask': {
        r = window.volgactf.qualifier.templates.eventLogOpenTask({
          _: _,
          moment: moment,
          createdAt: createdAt,
          task: eventData
        })
        break
      }
      case 'closeTask': {
        r = window.volgactf.qualifier.templates.eventLogCloseTask({
          _: _,
          moment: moment,
          createdAt: createdAt,
          task: eventData
        })
        break
      }
      case 'createTaskCategory': {
        const task = _.findWhere(taskProvider.getTaskPreviews(), { id: eventData.taskId })
        const category = _.findWhere(categoryProvider.getCategories(), { id: eventData.categoryId })
        if (task && category) {
          r = window.volgactf.qualifier.templates.eventLogCreateTaskCategory({
            _: _,
            moment: moment,
            createdAt: createdAt,
            task: task,
            category: category
          })
        }
        break
      }
      case 'deleteTaskCategory': {
        const task = _.findWhere(taskProvider.getTaskPreviews(), { id: eventData.taskId })
        const category = _.findWhere(categoryProvider.getCategories(), { id: eventData.categoryId })
        if (task && category) {
          r = window.volgactf.qualifier.templates.eventLogDeleteTaskCategory({
            _: _,
            moment: moment,
            createdAt: createdAt,
            task: task,
            category: category
          })
        }
        break
      }
      case 'createTaskValue': {
        const task = _.findWhere(taskProvider.getTaskPreviews(), { id: eventData.taskId })
        if (task) {
          r = window.volgactf.qualifier.templates.eventLogCreateTaskValue({
            _: _,
            moment: moment,
            createdAt: createdAt,
            task: task,
            taskValue: eventData
          })
        }
        break
      }
      case 'updateTaskValue': {
        const task = _.findWhere(taskProvider.getTaskPreviews(), { id: eventData.taskId })
        if (task) {
          r = window.volgactf.qualifier.templates.eventLogUpdateTaskValue({
            _: _,
            moment: moment,
            createdAt: createdAt,
            task: task,
            taskValue: eventData
          })
        }
        break
      }
      case 'createTaskRewardScheme': {
        const task = _.findWhere(taskProvider.getTaskPreviews(), { id: eventData.taskId })
        if (task) {
          r = window.volgactf.qualifier.templates.eventLogCreateTaskRewardScheme({
            _: _,
            moment: moment,
            createdAt: createdAt,
            task: task,
            taskRewardScheme: eventData
          })
        }
        break
      }
      case 'updateTaskRewardScheme': {
        const task = _.findWhere(taskProvider.getTaskPreviews(), { id: eventData.taskId })
        if (task) {
          r = window.volgactf.qualifier.templates.eventLogUpdateTaskRewardScheme({
            _: _,
            moment: moment,
            createdAt: createdAt,
            task: task,
            taskRewardScheme: eventData
          })
        }
        break
      }
      case 'createTeam': {
        r = window.volgactf.qualifier.templates.eventLogCreateTeam({
          _: _,
          moment: moment,
          createdAt: createdAt,
          team: eventData
        })
        break
      }
      case 'updateTeamEmail': {
        r = window.volgactf.qualifier.templates.eventLogUpdateTeamEmail({
          _: _,
          moment: moment,
          createdAt: createdAt,
          team: eventData
        })
        break
      }
      case 'updateTeamProfile': {
        r = window.volgactf.qualifier.templates.eventLogUpdateTeamProfile({
          _: _,
          moment: moment,
          createdAt: createdAt,
          team: eventData
        })
        break
      }
      case 'updateTeamPassword': {
        r = window.volgactf.qualifier.templates.eventLogUpdateTeamPassword({
          _: _,
          moment: moment,
          createdAt: createdAt,
          team: eventData
        })
        break
      }
      case 'updateTeamLogo': {
        r = window.volgactf.qualifier.templates.eventLogUpdateTeamLogo({
          _: _,
          moment: moment,
          createdAt: createdAt,
          team: eventData
        })
        break
      }
      case 'qualifyTeam': {
        r = window.volgactf.qualifier.templates.eventLogQualifyTeam({
          _: _,
          moment: moment,
          createdAt: createdAt,
          team: eventData
        })
        break
      }
      case 'disqualifyTeam': {
        r = window.volgactf.qualifier.templates.eventLogDisqualifyTeam({
          _: _,
          moment: moment,
          createdAt: createdAt,
          team: eventData
        })
        break
      }
      case 'loginTeam': {
        r = window.volgactf.qualifier.templates.eventLogLoginTeam({
          _: _,
          moment: moment,
          createdAt: createdAt,
          team: eventData.team,
          geoIP: eventData.geoIP
        })
        break
      }
      case 'logoutTeam': {
        r = window.volgactf.qualifier.templates.eventLogLogoutTeam({
          _: _,
          moment: moment,
          createdAt: createdAt,
          team: eventData
        })
        break
      }
      case 'createTeamTaskHit': {
        const team = _.findWhere(teamProvider.getTeams(), { id: eventData.teamId })
        const task = _.findWhere(taskProvider.getTaskPreviews(), { id: eventData.taskId })
        if (team && task) {
          r = window.volgactf.qualifier.templates.eventLogCreateTeamTaskHit({
            _: _,
            moment: moment,
            createdAt: createdAt,
            team: team,
            task: task,
            teamTaskHit: eventData
          })
        }
        break
      }
      case 'createTeamTaskHitAttempt': {
        const team = _.findWhere(teamProvider.getTeams(), { id: eventData.teamId })
        const task = _.findWhere(taskProvider.getTaskPreviews(), { id: eventData.taskId })
        if (team && task) {
          r = window.volgactf.qualifier.templates.eventLogCreateTeamTaskHitAttempt({
            _: _,
            moment: moment,
            createdAt: createdAt,
            team: team,
            task: task,
            teamTaskHitAttempt: eventData
          })
        }
        break
      }
      case 'createTeamTaskReview': {
        const team = _.findWhere(teamProvider.getTeams(), { id: eventData.teamId })
        const task = _.findWhere(taskProvider.getTaskPreviews(), { id: eventData.taskId })
        if (team && task) {
          r = window.volgactf.qualifier.templates.eventLogCreateTeamTaskReview({
            _: _,
            moment: moment,
            createdAt: createdAt,
            team: team,
            task: task,
            teamTaskReview: eventData
          })
        }
        break
      }
      case 'createTaskFile': {
        const task = _.findWhere(taskProvider.getTaskPreviews(), { id: eventData.taskId })
        if (task) {
          r = window.volgactf.qualifier.templates.eventLogCreateTaskFile({
            _: _,
            moment: moment,
            createdAt: createdAt,
            task: task,
            taskFile: eventData
          })
        }
        break
      }
      case 'deleteTaskFile': {
        const task = _.findWhere(taskProvider.getTaskPreviews(), { id: eventData.taskId })
        if (task) {
          r = window.volgactf.qualifier.templates.eventLogDeleteTaskFile({
            _: _,
            moment: moment,
            createdAt: createdAt,
            task: task,
            taskFile: eventData
          })
        }
        break
      }
      default: {
        r = window.volgactf.qualifier.templates.eventLogUnknown({
          _: _,
          moment: moment,
          eventName: eventName,
          createdAt: createdAt
        })
        break
      }
    }

    return r
  }
}

export default EventBaseView
