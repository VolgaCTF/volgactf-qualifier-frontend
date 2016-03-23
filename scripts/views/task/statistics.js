import $ from 'jquery'
import View from '../base'
import renderTemplate from '../../utils/render-template'
import dataStore from '../../data-store'
import navigationBar from '../../navigation-bar'
import statusBar from '../../status-bar'
import metadataStore from '../../utils/metadata-store'
import contestProvider from '../../providers/contest'
import identityProvider from '../../providers/identity'
import taskProvider from '../../providers/task'
import taskHintProvider from '../../providers/task-hint'
import teamTaskReviewProvider from '../../providers/team-task-review'
import teamTaskHitProvider from '../../providers/team-task-hit'
import teamProvider from '../../providers/team'
import History from 'history.js'
import moment from 'moment'
import MarkdownRenderer from '../../utils/markdown'
import _ from 'underscore'

class TaskStatisticsView extends View {
  constructor () {
    super(/^\/task\/[0-9]{1,5}\/statistics$/)
    this.$main = null
  }

  getTitle () {
    return `${metadataStore.getMetadata('event-title')} :: Task statistics`
  }

  getTaskId () {
    let url = History.getState().data.urlPath
    let urlParts = url.split('/')
    return parseInt(urlParts[urlParts.length - 2], 10)
  }

  renderPage (task, taskHints, taskHits, taskReviews, teams) {
    this.$main.html(renderTemplate('task-statistics-view', {
      task: task,
      taskHints: taskHints,
      taskHits: taskHits,
      taskReviews: taskReviews,
      teams: teams,
      utils: {
        underscore: _,
        moment: moment,
        md: new MarkdownRenderer()
      }
    }))
  }

  present () {
    this.$main = $('#main')
    this.$main.html(renderTemplate('loading-view'))

    $
      .when(
        identityProvider.fetchIdentity(),
        contestProvider.fetchContest()
      )
      .done((identity, contest) => {
        if (identity.isSupervisor()) {
          if (dataStore.supportsRealtime()) {
            dataStore.connectRealtime()
          }

          identityProvider.subscribe()

          navigationBar.present()
          statusBar.present()

          let taskId = this.getTaskId()

          $
            .when(
              taskProvider.fetchTask(taskId),
              taskHintProvider.fetchTaskHintsByTask(taskId),
              teamTaskHitProvider.fetchTaskHits(taskId),
              teamTaskReviewProvider.fetchTeamTaskReviewsByTask(taskId),
              teamProvider.fetchTeams()
            )
            .done((task, taskHints, taskHits, taskReviews, teams) => {
              this.renderPage(task, taskHints, taskHits, taskReviews, teams)
            })
            .fail((err) => {
              console.error(err)
              this.$main.html(renderTemplate('internal-error-view'))
            })
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
    navigationBar.dismiss()
    statusBar.dismiss()

    if (dataStore.supportsRealtime()) {
      dataStore.disconnectRealtime()
    }
  }
}

export default new TaskStatisticsView()
