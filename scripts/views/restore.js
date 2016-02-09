import $ from 'jquery'
import View from './base'
import renderTemplate from '../utils/render-template'
import dataStore from '../data-store'
import navigationBar from '../navigation-bar'
import stateController from '../controllers/state'
import metadataStore from '../utils/metadata-store'
import identityProvider from '../providers/identity'
import 'parsley'
import 'jquery.form'


class RestoreView extends View {
  constructor() {
    super(/^\/restore$/)
    this.$main = null
  }

  getTitle() {
    return `${metadataStore.getMetadata('event-title')} :: Restore password`
  }

  initRestoreForm() {
    let $form = this.$main.find('form.themis-form-restore')
    $form.parsley()

    $form.find('input[name="email"]').focus()

    let $successAlert = this.$main.find('div.themis-alert-restore')

    let $submitError = $form.find('.submit-error > p')
    let $submitButton = $form.find('button')

    $form.on('submit', (e) => {
      e.preventDefault()
      $form.ajaxSubmit({
        beforeSubmit: () => {
          $submitError.text('')
          $submitButton.prop('disabled', true)
        },
        clearForm: true,
        dataType: 'json',
        xhrFields: {
          withCredentials: true
        },
        headers: {
          'X-CSRF-Token': identityProvider.getIdentity().token
        },
        success: (responseText, textStatus, jqXHR) => {
          $form.hide()
          $successAlert.show()
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

  present() {
    this.$main = $('#main')

    $
      .when(identityProvider.fetchIdentity())
      .done((identity) => {
        identityProvider.subscribe()

        navigationBar.present()

        if (identity.role === 'guest') {
          this.$main.html(renderTemplate('restore-view'))
          this.initRestoreForm()
        } else {
          this.$main.html(renderTemplate('already-authenticated-view'))
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


export default new RestoreView()
