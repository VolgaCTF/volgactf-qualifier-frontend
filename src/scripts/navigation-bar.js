import $ from 'jquery'
import _ from 'underscore'
import moment from 'moment'

import identityProvider from './providers/identity'
import contestProvider from './providers/contest'
import dataStore from './data-store'

class NavigationBar {
  constructor () {
    this.$streamStateContainer = null
    this.$contestStateContainer = null

    this.streamStateInterval = null
    this.onStreamState = null

    this.onUpdateContest = null
    this.onUpdateTimer = null
    this.timerInterval = null

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
      this.$streamStateContainer.html(window.themis.quals.templates.streamStatePartial({
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

    const $curHtml = $(window.themis.quals.templates.contestStatePartial({
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

  present () {
    const $navbar = $('#themis-navbar')
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

    this.$streamStateContainer = $('#themis-quals-stream-state')
    this.renderStreamState()

    this.onStreamState = () => {
      this.renderStreamState()
    }
    this.streamStateInterval = setInterval(this.onStreamState, 1000)

    this.$contestStateContainer = $('#themis-quals-contest-state')
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
  }
}

export default new NavigationBar()
