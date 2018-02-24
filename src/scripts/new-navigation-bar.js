import $ from 'jquery'
import identityProvider from './providers/identity'

class NewNavigationBar {
  present () {
    let $navbar = $('#themis-navbar')
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

export default new NewNavigationBar()
