import $ from 'jquery'
import View from '../base'
import newNavigationBar from '../../new-navigation-bar'
import metadataStore from '../../utils/metadata-store'
import contestProvider from '../../providers/contest'
import identityProvider from '../../providers/identity'
import countryProvider from '../../providers/country'
import 'parsley'
import 'jquery-form'
import parsleyBootstrapOptions from '../../utils/parsley-bootstrap'


class TeamSignupView extends View {
  constructor () {
    super(/^\/team\/signup$/)
    this.$main = null
  }

  getTitle () {
    return `${metadataStore.getMetadata('event-title')} :: Sign up`
  }

  initSignupForm () {
    let $form = this.$main.find('form.themis-form-signup')
    $form.parsley({
      errorClass: 'is-invalid',
      successClass: 'is-valid',
      classHandler: function(ParsleyField) {
        return ParsleyField.$element;
      },
      errorsContainer: function(ParsleyField) {
        return ParsleyField.$element.parents('.col-sm-8');
      },
      errorsWrapper: '<div class="invalid-feedback">',
      errorTemplate: '<span></span>'
    })

    $form.find('input[name="team"]').focus()

    let $successAlert = this.$main.find('div.themis-alert-signup')

    let $submitError = $form.find('.submit-error > p')
    let $submitButton = $form.find('button')

    $("input[type=file]").change(function () {
      var fieldVal = $(this).val();

      // Change the node's value by removing the fake path (Chrome)
      fieldVal = fieldVal.replace("C:\\fakepath\\", "");

      if (fieldVal != undefined || fieldVal != "") {
        $(this).next(".custom-file-label").attr('data-content', fieldVal);
        $(this).next(".custom-file-label").text(fieldVal);
      } else {
        $(this).next('.custom-file-label').attr('data-content', '');
        $(this).next('.custom-file-label').text('Choose file');
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
        identityProvider.initIdentity(),
        contestProvider.initContest(),
        countryProvider.initCountries()
      )
      .done((identity, contest, countries) => {
        identityProvider.subscribe()
        newNavigationBar.present()

        if (identity.isGuest() && !contest.isFinished()) {
          this.initSignupForm()
        }
      })
  }

  dismiss () {
    identityProvider.unsubscribe()
    this.$main.empty()
    this.$main = null
    newNavigationBar.dismiss()
  }
}

export default new TeamSignupView()
