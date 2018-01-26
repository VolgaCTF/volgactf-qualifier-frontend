import $ from 'jquery'
import _ from 'underscore'
import renderTemplate from './utils/render-template'
import dataStore from './data-store'
import moment from 'moment'
import contestProvider from './providers/contest'
import identityProvider from './providers/identity'
import 'bootstrap'
import 'parsley'
import 'bootstrap-datetimepicker'

class StatusBar {
  constructor () {
    this.$container = null
    this.$stateContainer = null
    this.$timerContainer = null
    this.$realtimeContainer = null

    this.onUpdateContest = null
    this.onUpdateTeamScore = null

    this.timerInterval = null

    this.onReloadTeamScore = null
    this.reloadTeamScore = false
    this.reloadTeamScoreInterval = null
    this.renderingTeamScore = false

    this.realtimeControlInterval = null
    this.onRealtimeControl = null

    dataStore.onConnectedRealtime(() => {
      this.renderRealtimeState()
    })
  }

  initUpdateContestModal () {
    let $modal = $('#update-contest-modal')
    $modal.modal({ show: false })

    let $submitError = $modal.find('.submit-error > p')
    let $submitButton = $modal.find('button[data-action="complete-update-contest"]')
    let $form = $modal.find('form')
    $form.parsley()

    let $contestState = $('#update-contest-state')
    let $contestStartsAt = $('#update-contest-starts')
    let $contestFinishesAt = $('#update-contest-finishes')

    let pickerFormat = 'D MMM YYYY [at] HH:mm'

    $contestStartsAt.datetimepicker({
      showClose: true,
      sideBySide: true,
      format: pickerFormat
    })

    $contestFinishesAt.datetimepicker({
      showClose: true,
      sideBySide: true,
      format: pickerFormat
    })

    $submitButton.on('click', (e) => {
      $form.trigger('submit')
    })

    let updateOptions = (initial, started, paused, finished) => {
      $contestState.find('option[value="1"]').prop('disabled', !initial)
      $contestState.find('option[value="2"]').prop('disabled', !started)
      $contestState.find('option[value="3"]').prop('disabled', !paused)
      $contestState.find('option[value="4"]').prop('disabled', !finished)
    }

    $modal.on('show.bs.modal', (e) => {
      let contest = contestProvider.getContest()
      $contestState.val(contest.state)

      if (contest.isInitial()) {
        updateOptions(true, true, false, false)
      } else if (contest.isStarted()) {
        updateOptions(false, true, true, true)
      } else if (contest.isPaused()) {
        updateOptions(false, true, true, true)
      } else if (contest.isFinished()) {
        updateOptions(false, false, false, true)
      }

      $contestStartsAt.data('DateTimePicker').date(contest.startsAt)
      $contestFinishesAt.data('DateTimePicker').date(contest.finishesAt)
      $submitError.text('')
    })

    $modal.on('shown.bs.modal', (e) => {
      $contestState.focus()
    })

    $form.on('submit', (e) => {
      let valStartsAt = $contestStartsAt.data('DateTimePicker').date()
      let valFinishesAt = $contestFinishesAt.data('DateTimePicker').date()

      e.preventDefault()
      $form.ajaxSubmit({
        beforeSubmit: () => {
          $submitError.text('')
          $submitButton.prop('disabled', true)
        },
        clearForm: true,
        data: {
          startsAt: (valStartsAt) ? valStartsAt.seconds(0).milliseconds(0).valueOf() : null,
          finishesAt: (valFinishesAt) ? valFinishesAt.seconds(0).milliseconds(0).valueOf() : null
        },
        dataType: 'json',
        headers: {
          'X-CSRF-Token': identityProvider.getIdentity().token
        },
        success: (responseJSON, textStatus, jqXHR) => {
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

  renderContestState () {
    let contest = contestProvider.getContest()

    this.$stateContainer.html(renderTemplate('contest-state-partial', {
      contest: contest,
      identity: identityProvider.getIdentity()
    }))
  }

  renderContestTimer () {
    this.$timerContainer.empty()
    let contest = contestProvider.getContest()

    if (contest.isInitial() && contest.startsAt) {
      this.$timerContainer.html(renderTemplate('contest-timer-initial', {
        startsAt: moment(contest.startsAt).format('lll'),
        interval: moment(contest.startsAt).fromNow()
      }))
    }

    if (contest.isStarted()) {
      this.$timerContainer.html(renderTemplate('contest-timer-started', {
        finishesAt: moment(contest.finishesAt).format('lll'),
        interval: moment(contest.finishesAt).fromNow()
      }))
    }

    if (contest.isPaused()) {
      this.$timerContainer.html(renderTemplate('contest-timer-paused'))
    }

    if (contest.isFinished()) {
      this.$timerContainer.html(renderTemplate('contest-timer-finished', {
        finishesAt: moment(contest.finishesAt).format('lll'),
        interval: moment(contest.finishesAt).fromNow()
      }))
    }
  }

  renderTeamScore () {
    this.$scoreContainer.empty()
    let identity = identityProvider.getIdentity()
    let contest = contestProvider.getContest()

    if (!identity.isTeam() || contest.isInitial()) {
      return
    }

    let teamScores = contestProvider.getTeamScores()
    let teamScore = _.findWhere(teamScores, { teamId: identity.id })
    if (teamScore) {
      teamScores.sort(contestProvider.teamRankFunc)
      let teamNdx = _.findIndex(teamScores, (teamScore) => {
        return teamScore.teamId === identity.id
      })

      this.$scoreContainer.html(renderTemplate('contest-score', {
        teamRank: teamNdx + 1,
        teamScore: teamScore.score
      }))
    }
  }

  renderRealtimeState () {
    if (!this.$realtimeContainer) {
      return
    }

    this.$realtimeContainer.empty()
    let state = null
    switch (dataStore.getRealtimeConnectionState()) {
      case -1:
        state = 'not-supported'
        break
      case 0:
        state = 'connecting'
        break
      case 1:
        state = 'connected'
        break
      case 2:
        state = 'closed'
        break
      default:
        state = 'n/a'
        break
    }

    this.$realtimeContainer.html(renderTemplate('contest-realtime-state', { state: state }))
    let $state = this.$realtimeContainer.find('span')
    $state.tooltip()
  }

  present () {
    this.$container = $('#themis-statusbar')
    this.$container.html(renderTemplate('statusbar-view'))
    this.$stateContainer = $('#themis-contest-state')
    this.renderContestState()

    this.$timerContainer = $('#themis-contest-timer')
    this.renderContestTimer()

    let identity = identityProvider.getIdentity()

    this.$scoreContainer = $('#themis-contest-score')
    if (identity.isTeam()) {
      this.renderTeamScore()
    }

    if (identity.isAdmin()) {
      this.initUpdateContestModal()
    }

    this.onUpdateContest = (e) => {
      this.renderContestState()
      this.renderContestTimer()
      return false
    }

    let onUpdateTimer = () => {
      this.renderContestTimer()
    }

    this.timerInterval = setInterval(onUpdateTimer, 60000)

    contestProvider.subscribe()
    contestProvider.on('updateContest', this.onUpdateContest)

    if (identity.isTeam()) {
      this.onUpdateTeamScore = (teamScore) => {
        this.reloadTeamScore = true
        return false
      }

      contestProvider.on('updateTeamScore', this.onUpdateTeamScore)

      this.onReloadTeamScore = () => {
        if (!this.reloadTeamScore || this.renderingTeamScore) {
          return
        }
        this.renderingTeamScore = true
        this.renderTeamScore()
        this.reloadTeamScore = false
        this.renderingTeamScore = false
      }

      this.reloadTeamScoreInterval = setInterval(this.onReloadTeamScore, 1000)
    }

    this.$realtimeContainer = $('#themis-realtime-state')
    this.renderRealtimeState()

    this.onRealtimeControl = () => {
      this.renderRealtimeState()
    }

    this.realtimeControlInterval = setInterval(this.onRealtimeControl, 1000)
  }

  dismiss () {
    if (this.onUpdateContest) {
      contestProvider.off('updateContest', this.onUpdateContest)
      this.onUpdateContest = null
    }

    if (this.onUpdateTeamScore) {
      contestProvider.off('updateTeamScore', this.onUpdateTeamScore)
      this.onUpdateTeamScore = null
    }

    if (this.onReloadTeamScore) {
      clearInterval(this.reloadTeamScoreInterval)
      this.onReloadTeamScore = null
      this.renderingTeamScore = false
      this.reloadTeamScore = false
    }

    contestProvider.unsubscribe()

    if (this.timerInterval) {
      clearInterval(this.timerInterval)
      this.timerInterval = null
    }

    if (this.onRealtimeControl) {
      clearInterval(this.realtimeControlInterval)
      this.onRealtimeControl = null
    }

    if (this.$container && this.$container.length) {
      this.$container.empty()
      this.$container = null
    }

    this.$stateContainer = null
    this.$timerContainer = null
    this.$scoreContainer = null
  }
}

export default new StatusBar()
