import $ from 'jquery'
import View from './base'
import renderTemplate from '../utils/render-template'
import navigationBar from '../navigation-bar'
import stateController from '../controllers/state'
import metadataStore from '../utils/metadata-store'
import identityProvider from '../providers/identity'
import 'parsley'
import 'jquery.form'

class SigninView extends View {
  constructor () {
    super(/^\/team\/signin$/)
    this.$main = null
  }

  getTitle () {
    return `${metadataStore.getMetadata('event-title')} :: Sign in`
  }

  initSigninForm () {
    let $form = this.$main.find('form.themis-form-signin')
    $form.parsley()

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
          stateController.navigateTo('/')
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
      .when(identityProvider.fetchIdentity())
      .done((identity) => {
        identityProvider.subscribe()

        navigationBar.present({ active: 'signin' })

        if (identity.isGuest()) {
          this.$main.html(renderTemplate('signin-view'))
          this.initSigninForm()
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

export default new SigninView()
