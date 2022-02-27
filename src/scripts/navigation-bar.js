import $ from 'jquery'
import _ from 'underscore'
import moment from 'moment'

import identityProvider from './providers/identity'
import contestProvider from './providers/contest'
import teamRankingProvider from './providers/team-ranking'
import identityLogoProvider from './providers/identity-logo'
import dataStore from './data-store'

class NavigationBar {
  constructor () {
    this.$streamStateContainer = null
    this.$contestStateContainer = null
    this.$teamRankingContainer = null

    this.streamStateInterval = null
    this.onStreamState = null

    this.onUpdateContest = null
    this.onUpdateTimer = null
    this.timerInterval = null

    this.onUpdateTeamRankings = null
    this.teamRankingTemplate = null

    this.onUpdateTeamLogo = null

    dataStore.onConnectedRealtime(() => {
      this.renderStreamState()
    })
  }

  renderStreamState () {
    if (!this.$streamStateContainer) {
      return
    }

    const prevState = this.$streamStateContainer.attr('data-stream-state')
    let curState = null
    switch (dataStore.getRealtimeConnectionState()) {
      case 0:
        curState = 'connecting'
        break
      case 1:
        curState = 'open'
        break
      case 2:
        curState = 'closed'
        break
      default:
        curState = 'closed'
        break
    }

    if (prevState !== curState) {
      const $prevSpan = this.$streamStateContainer.find('span:first')
      if ($prevSpan.length > 0) {
        $prevSpan.tooltip('dispose')
      }
      this.$streamStateContainer.attr('data-stream-state', curState)
      this.$streamStateContainer.html(window.volgactf.qualifier.templates.streamStatePartial({
        _: _,
        state: curState
      }))
      const $curSpan = this.$streamStateContainer.find('span:first')
      if ($curSpan.length > 0) {
        $curSpan.tooltip()
      }
    }
  }

  renderContestState (force = false) {
    const prevState = this.$contestStateContainer.attr('data-contest-state')
    const prevLabel = this.$contestStateContainer.attr('data-contest-label')

    const $curHtml = $(window.volgactf.qualifier.templates.contestStatePartial({
      _: _,
      contest: contestProvider.getContest(),
      moment: moment
    }))
    let curState = null
    switch (contestProvider.getContest().state) {
      case 1:
        curState = 'notStarted'
        break
      case 2:
        curState = 'started'
        break
      case 3:
        curState = 'paused'
        break
      case 4:
        curState = 'finished'
        break
    }
    const curLabel = $curHtml.attr('title')

    if (prevState !== curState || prevLabel !== curLabel) {
      const $prevSpan = this.$contestStateContainer.find('span:first')
      if ($prevSpan.length > 0) {
        $prevSpan.tooltip('dispose')
      }
      this.$contestStateContainer.attr('data-contest-state', curState)
      this.$contestStateContainer.attr('data-contest-label', curLabel)
      this.$contestStateContainer.html($curHtml)
      const $curSpan = this.$contestStateContainer.find('span:first')
      if ($curSpan.length > 0) {
        $curSpan.tooltip()
      }
    }
  }

  formatOrdinal (n) {
    const s = ['th', 'st', 'nd', 'rd']
    const v = n % 100
    return n.toString() + (s[(v - 20) % 10] || s[v] || s[0])
  }

  renderTeamRanking () {
    if (!identityProvider.getIdentity().isTeam()) {
      return
    }
    const identityId = identityProvider.getIdentity().id
    const orderedTeamRankings = _.sortBy(teamRankingProvider.getTeamRankings(), 'position')
    const ndx = _.findIndex(orderedTeamRankings, function (entry) {
      return entry.teamId === identityId
    })
    if (ndx !== -1) {
      if (_.isNull(this.teamRankingTemplate)) {
        if (window.location.pathname.indexOf('/scoreboard') === 0) {
          this.teamRankingTemplate = _.template('<span class="navbar-text text-info"><span class="oi oi-spreadsheet"></span>&nbsp;<%- rankFormatted %>&nbsp;/&nbsp;<%- score %>&nbsp;pts</span>')
        } else {
          this.teamRankingTemplate = _.template('<a href="/scoreboard" class="navbar-text text-info"><span class="oi oi-spreadsheet"></span>&nbsp;<%- rankFormatted %>&nbsp;/&nbsp;<%- score %>&nbsp;pts</a>')
        }
      }

      this.$teamRankingContainer.html(this.teamRankingTemplate({
        _: _,
        rankFormatted: this.formatOrdinal(ndx + 1),
        score: orderedTeamRankings[ndx].score
      }))
    } else {
      this.$teamRankingContainer.empty()
    }
  }

  present () {
    const $navbar = $('#volgactf-navbar')
    const $signout = $navbar.find('a[data-action="signout"]')

    if ($signout.length > 0) {
      $signout.on('click', function (e) {
        e.preventDefault()
        e.stopPropagation()

        const identity = identityProvider.getIdentity()
        let url = null
        if (identity.isTeam()) {
          url = '/api/team/signout'
        } else if (identity.isSupervisor()) {
          url = '/api/supervisor/signout'
        }

        $.ajax({
          method: 'POST',
          url: url,
          dataType: 'json',
          success: function (responseText, textStatus, jqXHR) {
            window.location = '/'
          },
          error: function (jqXHR, textStatus, errorThrown) {
            console.log(errorThrown)
          }
        })
      })
    }

    this.$streamStateContainer = $('#volgactf-qualifier-stream-state')
    this.renderStreamState()

    this.onStreamState = () => {
      this.renderStreamState()
    }
    this.streamStateInterval = setInterval(this.onStreamState, 1000)

    this.$contestStateContainer = $('#volgactf-qualifier-contest-state')
    this.renderContestState(true)

    this.onUpdateContest = (e) => {
      this.renderContestState()
      return false
    }

    this.onUpdateTimer = () => {
      this.renderContestState()
    }
    this.timerInterval = setInterval(this.onUpdateTimer, 15000)

    contestProvider.on('updateContest', this.onUpdateContest)

    if (identityProvider.getIdentity().isTeam()) {
      identityLogoProvider.subscribe()

      this.onUpdateTeamLogo = (team) => {
        identityProvider.getIdentity().logoChecksum = team.logoChecksum
        const el = document.getElementById(`team-${team.id}-navbar-logo`)
        if (el) {
          el.setAttribute('src', `/team/logo/${team.id}/${team.logoChecksum}`)
        }
        return false
      }

      identityLogoProvider.on('updateTeamLogo', this.onUpdateTeamLogo)

      this.$teamRankingContainer = $('#volgactf-qualifier-team-ranking')

      this.onUpdateTeamRankings = (teamRankings) => {
        this.renderTeamRanking()
      }

      teamRankingProvider.on('updateTeamRankings', this.onUpdateTeamRankings)

      $
        .when(teamRankingProvider.fetchTeamRankings())
        .done((teamRankings) => {
          this.renderTeamRanking()
        })
        .fail((err) => {
          console.log(err)
        })
    }
  }
}

export default new NavigationBar()
