import $ from 'jquery'
import View from '../base'
import newNavigationBar from '../../new-navigation-bar'
import identityProvider from '../../providers/identity'
import 'parsley'
import 'jquery-form'
import parsleyBootstrapOptions from '../../utils/parsley-bootstrap'

class TeamSigninView extends View {
  constructor () {
    super()
    this.$main = null
  }

  initSigninForm () {
    let $form = this.$main.find('form.themis-form-signin')
    $form.parsley({
      errorClass: 'is-invalid',
      successClass: 'is-valid',
      classHandler: function (ParsleyField) {
        return ParsleyField.$element;
      },
      errorsContainer: function (ParsleyField) {
        return ParsleyField.$element.parents('form-group')
      },
      errorsWrapper: '<div class="invalid-feedback">',
      errorTemplate: '<span></span>'
    })

    $form.find('input[name="team"]').focus()

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
        headers: {
          'X-CSRF-Token': identityProvider.getIdentity().token
        },
        success: (responseText, textStatus, jqXHR) => {
          window.location = '/'
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

    $
      .when(identityProvider.initIdentity())
      .done((identity) => {
        identityProvider.subscribe()
        newNavigationBar.present({ active: 'signin' })

        if (identity.isGuest()) {
          this.initSigninForm()
        }
      })
  }
}

export default new TeamSigninView()
