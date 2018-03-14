import $ from 'jquery'
import View from '../base'
import contestProvider from '../../providers/contest'
import identityProvider from '../../providers/identity'
import countryProvider from '../../providers/country'
import 'parsley'
import 'jquery-form'

class TeamSignupView extends View {
  constructor () {
    super()
    this.$main = null
  }

  initSignupForm () {
    let $form = this.$main.find('form.themis-form-signup')
    $form.parsley({
      errorClass: 'is-invalid',
      successClass: 'is-valid',
      classHandler: function (ParsleyField) {
        return ParsleyField.$element
      },
      errorsContainer: function (ParsleyField) {
        return ParsleyField.$element.parents('.col-sm-8')
      },
      errorsWrapper: '<div class="invalid-feedback">',
      errorTemplate: '<span></span>'
    })

    $form.find('input[name="team"]').focus()

    let $successAlert = this.$main.find('div.themis-alert-signup')

    let $submitError = $form.find('.submit-error > p')
    let $submitButton = $form.find('button')

    $('input[type="file"]').change(function () {
      var fieldVal = $(this).val()

      // Change the node's value by removing the fake path (Chrome)
      fieldVal = fieldVal.replace('C:\\fakepath\\', '')

      if (typeof fieldVal !== 'undefined' || fieldVal !== '') {
        $(this).next('.custom-file-label').attr('data-content', fieldVal)
        $(this).next('.custom-file-label').text(fieldVal)
      } else {
        $(this).next('.custom-file-label').attr('data-content', '')
        $(this).next('.custom-file-label').text('Choose file')
      }
    })

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
          $form.hide()
          $successAlert.show()
        },
        error: (jqXHR, textStatus, errorThrown) => {
          if (jqXHR.responseJSON) {
            $submitError.text(jqXHR.responseJSON)
          } else {
            if (jqXHR.status === 413) {
              $submitError.text('Image size must not exceed 1 Mb. Please try again with another image.')
            } else {
              $submitError.text('Unknown error. Please try again later.')
            }
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
    .when(
      countryProvider.initCountries()
    )
    .done((countries) => {
      const identity = identityProvider.getIdentity()
      const contest = contestProvider.getContest()
      if (identity.isGuest() && !contest.isFinished()) {
        this.initSignupForm()
      }
    })
  }
}

export default new TeamSignupView()
