import $ from 'jquery'
import _ from 'underscore'
import moment from 'moment'
import contestProvider from './providers/contest'

class NewStatusBar {
  constructor () {
    this.$container = null
    this.$stateContainer = null
    this.$timerContainer = null

    this.onUpdateContest = null

    this.timerInterval = null
  }

  renderContestState () {
    let contest = contestProvider.getContest()

    this.$stateContainer.html(window.themis.quals.templates.contestStatePartial({
      _: _,
      contest: contest
    }))
  }

  renderContestTimer () {
    let contest = contestProvider.getContest()

    this.$timerContainer.html(window.themis.quals.templates.contestTimer({
      _: _,
      contest: contest,
      moment: moment
    }))
  }

  present () {
    this.$container = $('#themis-statusbar')
    this.$stateContainer = $('#themis-contest-state')

    this.$timerContainer = $('#themis-contest-timer')

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
  }
}

export default new NewStatusBar()
