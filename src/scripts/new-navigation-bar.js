import $ from 'jquery'
import _ from 'underscore'
import identityProvider from './providers/identity'
import dataStore from './data-store'

class NewNavigationBar {
  constructor () {
    this.$streamStateContainer = null

    this.streamStateInterval = null
    this.onStreamState = null

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
  }
}

export default new NewNavigationBar()
