import $ from 'jquery'
import View from '../base'
import newNavigationBar from '../../new-navigation-bar'
import identityProvider from '../../providers/identity'
import URLSearchParams from 'url-search-params'
import 'parsley'
import 'jquery-form'

class ResetPasswordView extends View {
  constructor () {
    super()
    this.$main = null
  }

  present () {
    this.$main = $('#main')

    $
      .when(identityProvider.initIdentity())
      .done((identity) => {
        identityProvider.subscribe()
        newNavigationBar.present()

        let $form = this.$main.find('form.themis-form-reset')
        $form.parsley({
          errorClass: 'is-invalid',
          successClass: 'is-valid',
          classHandler: function(ParsleyField) {
            return ParsleyField.$element;
          },
          errorsContainer: function(ParsleyField) {
            return ParsleyField.$element.parents('form-group');
          },
          errorsWrapper: '<div class="invalid-feedback">',
          errorTemplate: '<span></span>'
        })
        let $submitError = $form.find('.submit-error > p')
        let $submitButton = $form.find('button')

        let $successAlert = this.$main.find('div.themis-reset-success')
        let $errorAlert = this.$main.find('div.themis-reset-error')

        let urlParams = new URLSearchParams(window.location.search)
        if (urlParams.has('team') && urlParams.has('code')) {
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
                team: urlParams.get('team'),
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
      })
  }
}

export default new ResetPasswordView()
