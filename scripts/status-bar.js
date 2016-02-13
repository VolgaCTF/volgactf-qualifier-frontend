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
  }

  initUpdateContestModal () {
    let $updateContestModal = $('#update-contest-modal')
    $updateContestModal.modal({
      show: false
    })

    let $updateContestSubmitError = $updateContestModal.find('.submit-error > p')
    let $updateContestSubmitButton = $updateContestModal.find('button[data-action="complete-update-contest"]')
    let $updateContestForm = $updateContestModal.find('form')
    $updateContestForm.parsley()

    let $updateContestState = $('#update-contest-state')
    let $updateContestStartsAt = $('#update-contest-starts')
    let $updateContestFinishesAt = $('#update-contest-finishes')

    let pickerFormat = 'D MMM YYYY [at] HH:mm'

    $updateContestStartsAt.datetimepicker({
      showClose: true,
      sideBySide: true,
      format: pickerFormat
    })

    $updateContestFinishesAt.datetimepicker({
      showClose: true,
      sideBySide: true,
      format: pickerFormat
    })

    $updateContestSubmitButton.on('click', (e) => {
      $updateContestForm.trigger('submit')
    })

    $updateContestModal.on('show.bs.modal', (e) => {
      let contest = contestProvider.getContest()
      $updateContestState.val(contest.state)
      $updateContestStartsAt.data('DateTimePicker').date(contest.startsAt)
      $updateContestFinishesAt.data('DateTimePicker').date(contest.finishesAt)
      $updateContestSubmitError.text('')
    })

    $updateContestModal.on('shown.bs.modal', (e) => {
      $updateContestState.focus()
    })

    $updateContestForm.on('submit', (e) => {
      let valStartsAt = $updateContestStartsAt.data('DateTimePicker').date()
      let valFinishesAt = $updateContestFinishesAt.data('DateTimePicker').date()

      e.preventDefault()
      $updateContestForm.ajaxSubmit({
        beforeSubmit: () => {
          $updateContestSubmitError.text('')
          $updateContestSubmitButton.prop('disabled', true)
        },
        clearForm: true,
        data: {
          startsAt: (valStartsAt) ? valStartsAt.valueOf() : null,
          finishesAt: (valFinishesAt) ? valFinishesAt.valueOf() : null
        },
        dataType: 'json',
        xhrFields: {
          withCredentials: true
        },
        headers: {
          'X-CSRF-Token': identityProvider.getIdentity().token
        },
        success: (responseJSON, textStatus, jqXHR) => {
          $updateContestModal.modal('hide')
          if (!dataStore.connectedRealtime()) {
            window.location.reload()
          }
        },
        error: (jqXHR, textStatus, errorThrown) => {
          if (jqXHR.responseJSON) {
            $updateContestSubmitError.text(jqXHR.responseJSON)
          } else {
            $updateContestSubmitError.text('Unknown error. Please try again later.')
          }
        },
        complete: () => {
          $updateContestSubmitButton.prop('disabled', false)
        }
      })
    })
  }

  renderContestState () {
    let contest = contestProvider.getContest()
    let contestObj = {
      state: contest.state
    }

    this.$stateContainer.html(renderTemplate('contest-state-partial', {
      contest: contestObj,
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
    if (identity.role !== 'team') {
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
    this.$realtimeContainer.empty()
    let state = null
    if (dataStore.supportsRealtime()) {
      state = dataStore.connectedRealtime() ? 'online' : 'offline'
    } else {
      state = 'not-supported'
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
    if (identity.role === 'team') {
      this.renderTeamScore()
    }

    if (identity.role === 'admin') {
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

    if (identity.role === 'team') {
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

    this.realtimeControlInterval = setInterval(this.onRealtimeControl, 10000)
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
