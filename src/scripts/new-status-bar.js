import $ from 'jquery'
import _ from 'underscore'
import dataStore from './data-store'
import moment from 'moment'
import contestProvider from './providers/contest'
import identityProvider from './providers/identity'

class NewStatusBar {
  constructor () {
    this.$container = null
    this.$stateContainer = null
    this.$timerContainer = null

    this.onUpdateContest = null
    this.onUpdateTeamScore = null

    this.timerInterval = null

    this.onReloadTeamScore = null
    this.reloadTeamScore = false
    this.reloadTeamScoreInterval = null
    this.renderingTeamScore = false
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

      this.$scoreContainer.html(window.themis.quals.templates.contestScore({
        _: _,
        teamRank: teamNdx + 1,
        teamScore: teamScore.score
      }))
    }
  }

  present () {
    this.$container = $('#themis-statusbar')
    this.$stateContainer = $('#themis-contest-state')

    this.$timerContainer = $('#themis-contest-timer')

    let identity = identityProvider.getIdentity()

    this.$scoreContainer = $('#themis-contest-score')
    if (identity.isTeam()) {
      this.renderTeamScore()
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
  }
}

export default new NewStatusBar()
