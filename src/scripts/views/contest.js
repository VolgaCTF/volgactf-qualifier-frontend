import $ from 'jquery'
import View from './base'
import newNavigationBar from '../new-navigation-bar'
import newStatusBar from '../new-status-bar'
import contestProvider from '../providers/contest'
import identityProvider from '../providers/identity'
import dataStore from '../data-store'
import 'bootstrap'
import 'parsley'
import 'tempusdominius-bootstrap-4'

class ContestView extends View {
  constructor () {
    super()
    this.$main = null
    this.onUpdateContest = null
  }

  initForm () {
    const $submitError = this.$main.find('.submit-error > p')
    const $submitButton = this.$main.find('button[data-action="complete-update-contest"]')
    const $form = this.$main.find('form')
    $form.parsley()

    const $contestState = $('#update-contest-state')
    const $contestStartsAt = $('#update-contest-starts')
    const $contestFinishesAt = $('#update-contest-finishes')

    const pickerFormat = 'D MMM YYYY [at] HH:mm'

    const icons = {
      time: 'oi oi-clock',
      date: 'oi oi-calendar',
      up: 'oi oi-chevron-top',
      down: 'oi oi-chevron-bottom',
      previous: 'oi oi-chevron-left',
      next: 'oi oi-chevron-right',
      today: 'oi oi-check',
      clear: 'oi oi-trash',
      close: 'oi oi-x'
    }

    $contestStartsAt.datetimepicker({
      showClose: true,
      sideBySide: true,
      format: pickerFormat,
      icons: icons
    })

    $contestFinishesAt.datetimepicker({
      showClose: true,
      sideBySide: true,
      format: pickerFormat,
      icons: icons
    })

    $submitButton.on('click', (e) => {
      $form.trigger('submit')
    })

    const updateOptions = (initial, started, paused, finished) => {
      $contestState.find('option[value="1"]').prop('disabled', !initial)
      $contestState.find('option[value="2"]').prop('disabled', !started)
      $contestState.find('option[value="3"]').prop('disabled', !paused)
      $contestState.find('option[value="4"]').prop('disabled', !finished)
    }

    const populateForm = (e) => {
      const contest = contestProvider.getContest()
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

      $contestStartsAt.datetimepicker('date', contest.startsAt)
      $contestFinishesAt.datetimepicker('date', contest.finishesAt)
      $submitError.text('')
    }

    this.onUpdateContest = (e) => {
      populateForm()
      return false
    }

    populateForm()
    $contestState.focus()

    const identity = identityProvider.getIdentity()
    if (identity.isAdmin()) {
      $form.on('submit', (e) => {
        const valStartsAt = $contestStartsAt.datetimepicker('date')
        const valFinishesAt = $contestFinishesAt.datetimepicker('date')

        e.preventDefault()
        $form.ajaxSubmit({
          beforeSubmit: () => {
            $submitError.text('')
            $submitButton.prop('disabled', true)
          },
          data: {
            startsAt: (valStartsAt) ? valStartsAt.seconds(0).milliseconds(0).valueOf() : null,
            finishesAt: (valFinishesAt) ? valFinishesAt.seconds(0).milliseconds(0).valueOf() : null
          },
          dataType: 'json',
          headers: {
            'X-CSRF-Token': identityProvider.getIdentity().token
          },
          success: (responseJSON, textStatus, jqXHR) => {
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
  }

  present () {
    this.$main = $('#main')

    $
    .when(
      identityProvider.initIdentity(),
      contestProvider.initContest()
    )
    .done((identity, contest) => {
      identityProvider.subscribe()

      newNavigationBar.present()
      newStatusBar.present()
      this.initForm()

      contestProvider.on('updateContest', this.onUpdateContest)
    })
  }
}

export default new ContestView()
