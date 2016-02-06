import $ from 'jquery'
import View from './base'
import renderTemplate from '../utils/render-template'
import dataStore from '../data-store'
import navigationBar from '../navigation-bar'
import metadataStore from '../utils/metadata-store'
import identityProvider from '../providers/identity'
import History from 'jquery.history'


class VerifyEmailView extends View {
  constructor() {
    this.$main = null
    this.urlRegex = /^\/verify-email$/
  }

  getTitle() {
    return `${metadataStore.getMetadata('event-title')} :: Email verification`
  }

  present() {
    this.$main = $('#main')

    $
      .when(identityProvider.fetchIdentity())
      .done((identity) => {
        identityProvider.subscribe()
        navigationBar.present()

        this.$main.html(renderTemplate('verify-email-view', { identity: identity })

        let $progress = this.$main.find('p[data-role="progress"]')
        let $result = this.$main.find('p[data-role="result"]')

        dataStore.verifyEmail(History.getState().data.params, identity.token, (err, result) => {
          $progress.hide()
          if (err) {
            $result.addClass('text-danger').text(err)
          } else {
            $result.addClass('text-success').text('Email verified! Thank you!')
          }
        })
      .fail((err) => {
        navigationBar.present()
        this.$main.html(renderTemplate('internal-error-view'))
      })
  }

  dismiss() {
    identityProvider.unsubscribe()
    this.$main.empty()
    this.$main = null
    navigationBar.dismiss()
  }
}


export default new VerifyEmailView()
