import $ from 'jquery'
import _ from 'underscore'
import renderTemplate from './utils/render-template'
import identityProvider from './providers/identity'

class NavigationBar {
  present (options = {}) {
    let defaultOptions = {
      urlPath: window.location.pathname,
      active: null,
      identity: identityProvider.getIdentity()
    }

    options = _.extend(defaultOptions, options)

    let $navbar = $('#themis-navbar')
    $navbar.html(renderTemplate('navbar-view', options))

    let $signout = $navbar.find('a[data-action="signout"]')

    if ($signout.length > 0) {
      $signout.on('click', (e) => {
        e.preventDefault()
        e.stopPropagation()

        let identity = identityProvider.getIdentity()
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
          headers: {
            'X-CSRF-Token': identityProvider.getIdentity().token
          },
          success: (responseText, textStatus, jqXHR) => {
            window.location = '/'
          },
          error: (jqXHR, textStatus, errorThrown) => {
            console.log(errorThrown)
          }
        })
      })
    }
  }

  dismiss () {
    $('#themis-navbar').empty()
  }
}

export default new NavigationBar()
