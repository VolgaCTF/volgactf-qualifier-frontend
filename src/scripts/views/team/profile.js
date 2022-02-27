import $ from 'jquery'
import View from '../base'
import identityProvider from '../../providers/identity'
import teamProvider from '../../providers/team'
import contestProvider from '../../providers/contest'
import countryProvider from '../../providers/country'
import taskProvider from '../../providers/task'
import teamTaskHitProvider from '../../providers/team-task-hit'
import teamTaskReviewProvider from '../../providers/team-task-review'
import 'parsley'
import 'jquery-form'

class TeamProfileView extends View {
  constructor () {
    super()
    this.$main = null
    this.team = null
  }

  initUploadLogoModal () {
    const $button = this.$main.find('a[data-action="upload-logo"]')

    if ($button.length) {
      const $modal = $('#upload-logo-modal')
      $modal.modal({ show: false })

      const $submitError = $modal.find('.submit-error > p')
      const $submitButton = $modal.find('button[data-action="complete-upload-logo"]')
      const $form = $modal.find('form')
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

      $('input[type=file]').change(function () {
        let fieldVal = $(this).val()

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

      $submitButton.on('click', (e) => {
        $form.trigger('submit')
      })

      $modal.on('show.bs.modal', (e) => {
        $form.parsley().reset()
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
            const onTimeout = () => {
              $modal.modal('hide')
              window.location.reload()
            }

            setTimeout(onTimeout, 1500)
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
  }

  initChangeEmailModal () {
    const $button = this.$main.find('button[data-action="change-email"]')

    if ($button.length) {
      const $modal = $('#change-email-modal')
      $modal.modal({ show: false })

      const $submitError = $modal.find('.submit-error > p')
      const $submitButton = $modal.find('button[data-action="complete-change-email"]')
      const $form = $modal.find('form')
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

      $submitButton.on('click', (e) => {
        $form.trigger('submit')
      })

      $modal.on('show.bs.modal', (e) => {
        $('#change-email-new').val('')
        $submitError.text('')
        $form.parsley().reset()
      })

      $modal.on('shown.bs.modal', (e) => {
        $('#change-email-new').focus()
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
            $modal.modal('hide')
            window.location.reload()
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
  }

  initResendConfirmationModal () {
    const $button = this.$main.find('button[data-action="resend-confirmation"]')

    if ($button.length) {
      const $modal = $('#resend-confirmation-modal')
      $modal.modal({ show: false })

      const $submitError = $modal.find('.submit-error > p')
      const $submitSuccess = $modal.find('.submit-success > p')
      const $submitButton = $modal.find('button[data-action="complete-resend-confirmation"]')
      const $form = $modal.find('form')

      $submitButton.on('click', (e) => {
        $form.trigger('submit')
      })

      $modal.on('show.bs.modal', (e) => {
        $('#resend-confirmation-email').val(this.team.email)
        $submitError.text('')
        $submitSuccess.text('')
        $submitButton.show()
      })

      $modal.on('shown.bs.modal', (e) => {
        $('#resend-confirmation-email').focus()
      })

      $form.on('submit', (e) => {
        e.preventDefault()
        $form.ajaxSubmit({
          beforeSubmit: () => {
            $submitError.text('')
            $submitSuccess.text('')
            $submitButton.prop('disabled', true)
          },
          clearForm: true,
          dataType: 'json',
          headers: {
            'X-CSRF-Token': identityProvider.getIdentity().token
          },
          success: (responseText, textStatus, jqXHR) => {
            $submitButton.hide()
            $submitSuccess.text('A new confirmation email will be sent soon!')
            const hideModal = () => {
              $modal.modal('hide')
            }

            setTimeout(hideModal, 1000)
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
  }

  initEditProfileModal () {
    const $button = this.$main.find('button[data-action="edit-profile"]')

    if ($button.length) {
      const $modal = $('#edit-profile-modal')
      $modal.modal({ show: false })

      const $submitError = $modal.find('.submit-error > p')
      const $submitButton = $modal.find('button[data-action="complete-edit-profile"]')
      const $form = $modal.find('form')
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

      const $countrySelect = $('#edit-profile-country')
      for (const country of countryProvider.getCountries()) {
        $countrySelect.append($('<option></option>').attr('value', country.id).text(country.getName()))
      }

      $submitButton.on('click', (e) => {
        $form.trigger('submit')
      })

      $modal.on('show.bs.modal', (e) => {
        $countrySelect.val(this.team.countryId).focus()
        $('#edit-profile-locality').val(this.team.locality)
        $('#edit-profile-institution').val(this.team.institution)
        $submitError.text('')
      })

      $modal.on('shown.bs.modal', (e) => {
        $countrySelect.focus()
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
            $modal.modal('hide')
            window.location.reload()
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
  }

  toggleChangePasswordControl (toggle) {
    this.$main.find('button[data-action="change-password"]').toggle(toggle)
  }

  initChangePasswordModal () {
    const $button = this.$main.find('button[data-action="change-password"]')

    if ($button.length) {
      const $modal = $('#change-password-modal')
      $modal.modal({ show: false })

      const $submitError = $modal.find('.submit-error > p')
      const $submitSuccess = $modal.find('.submit-success > p')
      const $submitButton = $modal.find('button[data-action="complete-change-password"]')
      const $form = $modal.find('form')

      const $currentPassword = $('#change-pwd-current')
      const $newPassword = $('#change-pwd-new')
      const $confirmNewPassword = $('#change-pwd-confirm-new')

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

      $submitButton.on('click', (e) => {
        $form.trigger('submit')
      })

      $modal.on('show.bs.modal', (e) => {
        $currentPassword.val('')
        $newPassword.val('')
        $confirmNewPassword.val('')
        $form.find('div.form-group').show()
        $submitError.text('')
        $submitSuccess.text('')
        $submitButton.show()
        $form.parsley().reset()
      })

      $modal.on('shown.bs.modal', (e) => {
        $currentPassword.focus()
      })

      $form.on('submit', (e) => {
        e.preventDefault()
        $form.ajaxSubmit({
          beforeSubmit: () => {
            $submitError.text('')
            $submitSuccess.text('')
            $submitButton.prop('disabled', true)
          },
          clearForm: true,
          dataType: 'json',
          headers: {
            'X-CSRF-Token': identityProvider.getIdentity().token
          },
          success: (responseText, textStatus, jqXHR) => {
            $submitButton.hide()
            $form.find('div.form-group').hide()
            $submitSuccess.text('Password has been successfully changed!')
            const hideModal = () => {
              $modal.modal('hide')
            }

            setTimeout(hideModal, 1000)
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
  }

  toggleSetPasswordControl (toggle) {
    this.$main.find('button[data-action="set-password"]').toggle(toggle)
  }

  initSetPasswordModal () {
    const $button = this.$main.find('button[data-action="set-password"]')

    if ($button.length) {
      const $modal = $('#set-password-modal')
      $modal.modal({ show: false })

      const $submitError = $modal.find('.submit-error > p')
      const $submitSuccess = $modal.find('.submit-success > p')
      const $submitButton = $modal.find('button[data-action="complete-set-password"]')
      const $form = $modal.find('form')

      const $newPassword = $('#set-pwd-new')
      const $confirmNewPassword = $('#set-pwd-confirm-new')

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

      $submitButton.on('click', (e) => {
        $form.trigger('submit')
      })

      $modal.on('show.bs.modal', (e) => {
        $newPassword.val('')
        $confirmNewPassword.val('')
        $form.find('div.form-group').show()
        $submitError.text('')
        $submitSuccess.text('')
        $submitButton.show()
        $form.parsley().reset()
      })

      $modal.on('shown.bs.modal', (e) => {
        $newPassword.focus()
      })

      $form.on('submit', (e) => {
        e.preventDefault()
        $form.ajaxSubmit({
          beforeSubmit: () => {
            $submitError.text('')
            $submitSuccess.text('')
            $submitButton.prop('disabled', true)
          },
          clearForm: true,
          dataType: 'json',
          headers: {
            'X-CSRF-Token': identityProvider.getIdentity().token
          },
          success: (responseText, textStatus, jqXHR) => {
            $submitButton.hide()
            $form.find('div.form-group').hide()
            $submitSuccess.text('Password has been successfully set!')
            const hideModal = () => {
              $modal.modal('hide')
              this.toggleSetPasswordControl(false)
              this.initChangePasswordModal()
              this.toggleChangePasswordControl(true)
            }

            setTimeout(hideModal, 1000)
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
  }

  present () {
    this.$main = $('#main')

    const identity = identityProvider.getIdentity()
    const contest = contestProvider.getContest()
    const urlParts = window.location.pathname.split('/')
    const teamId = parseInt(urlParts[urlParts.length - 2], 10)
    let promise = null

    if (identity.isSupervisor()) {
      if (contest.isInitial()) {
        promise = $.when(
          teamProvider.initTeamProfile(),
          countryProvider.initCountries()
        )
      } else {
        promise = $.when(
          teamProvider.initTeamProfile(),
          countryProvider.initCountries(),
          teamTaskHitProvider.initTeamTaskHits(),
          teamTaskReviewProvider.initTeamTaskReviews(),
          taskProvider.initTaskPreviews()
        )
      }
    } else if (identity.isExactTeam(teamId)) {
      if (contest.isInitial()) {
        promise = $.when(
          teamProvider.initTeamProfile(),
          countryProvider.initCountries()
        )
      } else {
        promise = $.when(
          teamProvider.initTeamProfile(),
          countryProvider.initCountries(),
          teamTaskHitProvider.initTeamTaskHits(),
          teamTaskReviewProvider.initTeamTaskReviews(),
          taskProvider.initTaskPreviews()
        )
      }
    } else if (identity.isTeam()) {
      if (contest.isInitial()) {
        promise = $.when(
          teamProvider.initTeamProfile(),
          countryProvider.initCountries()
        )
      } else {
        promise = $.when(
          teamProvider.initTeamProfile(),
          countryProvider.initCountries(),
          teamTaskHitProvider.fetchTeamHitStatistics(teamId),
          teamTaskReviewProvider.fetchTeamReviewStatistics(teamId)
        )
      }
    } else {
      if (contest.isInitial()) {
        promise = $.when(
          teamProvider.initTeamProfile(),
          countryProvider.initCountries()
        )
      } else {
        promise = $.when(
          teamProvider.initTeamProfile(),
          countryProvider.initCountries(),
          teamTaskHitProvider.fetchTeamHitStatistics(teamId),
          teamTaskReviewProvider.fetchTeamReviewStatistics(teamId)
        )
      }
    }

    promise
      .done((team, countries, teamTaskHits, teamTaskReviews) => {
        this.team = team

        if (identity.isExactTeam(team.id)) {
          this.initUploadLogoModal()

          if (!identity.emailConfirmed) {
            this.initResendConfirmationModal()
            this.initChangeEmailModal()
          }

          this.initEditProfileModal()
          if (team.passwordSet) {
            this.toggleSetPasswordControl(false)
            this.initChangePasswordModal()
          } else {
            this.toggleChangePasswordControl(false)
            this.initSetPasswordModal()
          }
        }
      })
  }
}

export default new TeamProfileView()
