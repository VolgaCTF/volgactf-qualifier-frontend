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
import teamProvider from '../providers/team'
import taskProvider from '../providers/task'
import logProvider from '../providers/log'
import moment from 'moment'
import History from 'history.js'


class LogsView extends View {
  constructor() {
    super(/^\/logs$/)
    this.$main = null

    this.onCreateLog = null
    this.$section = null
    this.$logsContainer = null
  }

  getTitle() {
    return `${metadataStore.getMetadata('event-title')} :: Logs`
  }

  renderLog(log, teams, tasks) {
    let $el = null
    if (log.event === 1) {
      let team = _.findWhere(teams, { id: log.data.teamId })
      let task = _.findWhere(tasks, { id: log.data.taskId })
      if (team && task) {
        $el = $(renderTemplate('log-entry-1', {
          team: team,
          task: task,
          answer: log.data.answer,
          createdAt: moment(log.createdAt).format()
        }))
      }
    } else if (log.event === 2) {
      let team = _.findWhere(teams, { id: log.data.teamId })
      let task = _.findWhere(tasks, { id: log.data.taskId })
      if (team && task) {
        $el = $(renderTemplate('log-entry-2', {
          team: team,
          task: task,
          createdAt: moment(log.createdAt).format()
        }))
      }
    }

    return $el
  }

  renderLogs() {
    let logs = logProvider.getLogs()
    let teams = teamProvider.getTeams()
    let tasks = taskProvider.getTaskPreviews()

    let sortedLogs = _.sortBy(logs, 'createdAt')
    let logsContainerDetached = this.$logsContainer.detach()

    for (let log of sortedLogs) {
      let $el = this.renderLog(log, teams, tasks)
      if ($el && $el.length > 0) {
        logsContainerDetached.append($el)
      }
    }

    logsContainerDetached.appendTo(this.$section)
    logsContainerDetached = null
    this.$logsContainer = $('#themis-logs')
  }

  prependLog(log) {
    let teams = teamProvider.getTeams()
    let tasks = taskProvider.getTaskPreviews()

    let $el = this.renderLog(log, teams, tasks)
    if ($el && $el.length > 0) {
      this.$logsContainer.prepend($el)
    }
  }

  present() {
    this.$main = $('#main')
    this.$main.html(renderTemplate('loading-view'))

    $
      .when(identityProvider.fetchIdentity(), contestProvider.fetchContest())
      .done((identity, contest) => {
        if (_.contains(['admin', 'manager'], identity.role)) {
          let params = History.getState().data.params
          let all = (params.all)
          let promise = null
          if (all) {
            promise = $.when(teamProvider.fetchTeams(), taskProvider.fetchTaskPreviews(), logProvider.fetchLogs())
          } else {
            promise = $.when(teamProvider.fetchTeams(), taskProvider.fetchTaskPreviews())
          }

          promise
            .done(() => {
              identityProvider.subscribe()
              if (dataStore.supportsRealtime()) {
                dataStore.connectRealtime()
              }

              navigationBar.present({ active: 'logs' })
              statusBar.present()

              this.$main.html(renderTemplate('logs-view'))
              teamProvider.subscribe()
              taskProvider.subscribe()

              this.$section = this.$main.find('section')
              this.$logsContainer = $('#themis-logs')

              if (all) {
                this.renderLogs()
              }

              logProvider.subscribe()
              this.onCreateLog = (log) => {
                this.prependLog(log)
                return false
              }

              logProvider.on('createLog', this.onCreateLog)
            })
            .fail((err) => {
              navigationBar.present()
              this.$main.html(renderTemplate('internal-error-view'))
            })
        } else {
          this.$main.html(renderTemplate('access-forbidden-view', {
            urlPath: window.location.pathname
          }))
        }
      })
      .fail((err) => {
        navigationBar.present()
        this.$main.html(renderTemplate('internal-error-view'))
      })
  }

  dismiss() {
    identityProvider.unsubscribe()
    teamProvider.unsubscribe()
    taskProvider.unsubscribe()

    if (this.onCreateLog) {
      logProvider.off('createLog', this.onCreateLog)
      this.onCreateLog = null
    }
    logProvider.unsubscribe()

    this.$section = null
    this.$logsContainer = null

    this.$main.empty()
    this.$main = null
    navigationBar.dismiss()
    statusBar.dismiss()

    if (dataStore.supportsRealtime()) {
      dataStore.disconnectRealtime()
    }
  }
}


export default new LogsView()
