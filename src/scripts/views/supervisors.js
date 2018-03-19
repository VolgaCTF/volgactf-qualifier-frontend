import $ from 'jquery'
import View from './base'
import dataStore from '../data-store'
import identityProvider from '../providers/identity'
import 'bootstrap'
import 'parsley'

class SupervisorsView extends View {
  constructor () {
    super()
    this.$main = null
  }

  initForm () {
    const $submitError = this.$main.find('.submit-error > p')
    const $submitSuccess = this.$main.find('.submit-success > p')
    const $submitButton = this.$main.find('button[data-action="complete-invite-supervisor"]')
    const $form = this.$main.find('form')
    $form.parsley({
      errorClass: 'is-invalid',
      successClass: 'is-valid',
      classHandler: function (ParsleyField) {
        return ParsleyField.$element
      },
      errorsContainer: function (ParsleyField) {
        return ParsleyField.$element.parents('form-group')
      },
      errorsWrapper: '<div class="invalid-feedback">',
      errorTemplate: '<span></span>'
    })

    const $emailInput = $('#invite-supervisor-email')

    $submitButton.on('click', (e) => {
      $form.trigger('submit')
    })

    $form.on('submit', (e) => {
      e.preventDefault()
      $form.ajaxSubmit({
        beforeSubmit: () => {
          $submitError.text('')
          $submitSuccess.text('')
          $submitButton.prop('disabled', true)
        },
        dataType: 'json',
        headers: {
          'X-CSRF-Token': identityProvider.getIdentity().token
        },
        success: (responseJSON, textStatus, jqXHR) => {
          $submitSuccess.text('Invitation sent!')
          setTimeout(function () {
            $submitSuccess.text('')
            $emailInput.val('')
            if (!dataStore.connectedRealtime()) {
              window.location.reload()
            }
          }, 1500)
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

  present () {
    this.$main = $('#main')
    this.initForm()
  }
}

export default new SupervisorsView()
