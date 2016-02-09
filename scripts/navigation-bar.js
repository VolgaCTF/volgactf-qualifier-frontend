import $ from 'jquery'
import _ from 'underscore'
import renderTemplate from './utils/render-template'
import metadataStore from './utils/metadata-store'
import stateController from './controllers/state'
import identityProvider from './providers/identity'


class NavigationBar {
  present(options = {}) {
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

        let url = `${metadataStore.getMetadata('domain-api')}/signout`
        $.ajax({
          method: 'POST',
          url: url,
          dataType: 'json',
          xhrFields: {
            withCredentials: true
          },
          headers: {
            'X-CSRF-Token': identityProvider.getIdentity().token
          },
          success: (responseText, textStatus, jqXHR) => {
            stateController.navigateTo('/')
          },
          error: (jqXHR, textStatus, errorThrown) => {
            console.log(errorThrown)
          }
        })
      })
    }
  }

  dismiss() {
    $('#themis-navbar').empty()
  }
}


export default new NavigationBar()
