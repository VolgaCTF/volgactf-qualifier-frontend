import $ from 'jquery'
import View from '../base'
import identityProvider from '../../providers/identity'
import URLSearchParams from 'url-search-params'
import 'parsley'
import 'jquery-form'

class SupervisorCreateView extends View {
  constructor () {
    super()
    this.$main = null
  }

  present () {
    this.$main = $('#main')

    const $form = this.$main.find('form.volgactf-qualifier-form-supervisor-create')
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
    const $submitError = $form.find('.submit-error > p')
    const $submitButton = $form.find('button')

    const $successAlert = this.$main.find('div.volgactf-qualifier-create-supervisor-success')
    const $errorAlert = this.$main.find('div.volgactf-qualifier-create-supervisor-error')

    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.has('code')) {
      $form.show()

      $form.on('submit', (e) => {
        e.preventDefault()
        $form.ajaxSubmit({
          beforeSubmit: () => {
            $submitError.text('')
            $submitButton.prop('disabled', true)
          },
          clearForm: true,
          dataType: 'json',
          data: {
            code: urlParams.get('code')
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
    } else {
      $errorAlert.show()
    }
  }
}

export default new SupervisorCreateView()
