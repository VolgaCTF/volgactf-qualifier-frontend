import $ from 'jquery'
import View from './base'
import renderTemplate from '../utils/render-template'
import navigationBar from '../navigation-bar'
import metadataStore from '../utils/metadata-store'
import contestProvider from '../providers/contest'
import identityProvider from '../providers/identity'
import countryProvider from '../providers/country'
import 'parsley'
import 'jquery.form'
import 'bootstrap-filestyle'

class SignupView extends View {
  constructor () {
    super(/^\/team\/signup$/)
    this.$main = null
  }

  getTitle () {
    return `${metadataStore.getMetadata('event-title')} :: Sign up`
  }

  initSignupForm () {
    let $form = this.$main.find('form.themis-form-signup')
    $form.parsley()

    $form.find('input[name="team"]').focus()

    let $successAlert = this.$main.find('div.themis-alert-signup')

    let $submitError = $form.find('.submit-error > p')
    let $submitButton = $form.find('button')

    $form.find('input:file').filestyle()
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
      .when(
        identityProvider.fetchIdentity(),
        contestProvider.fetchContest(),
        countryProvider.fetchCountries()
      )
      .done((identity, contest, countries) => {
        identityProvider.subscribe()
        navigationBar.present()

        if (identity.role === 'guest') {
          if (contest.isFinished()) {
            this.$main.html(renderTemplate('signup-not-available-view'))
          } else {
            this.$main.html(renderTemplate('signup-view', {
              countries: countries
            }))
            this.initSignupForm()
          }
        } else {
          this.$main.html(renderTemplate('already-authenticated-view'))
        }
      })
      .fail((err) => {
        console.error(err)
        navigationBar.present()
        this.$main.html(renderTemplate('internal-error-view'))
      })
  }

  dismiss () {
    identityProvider.unsubscribe()
    this.$main.empty()
    this.$main = null
    navigationBar.dismiss()
  }
}

export default new SignupView()
