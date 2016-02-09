import $ from 'jquery'
import _ from 'underscore'
import View from './base'
import renderTemplate from '../utils/render-template'
import dataStore from '../data-store'
import navigationBar from '../navigation-bar'
import identityProvider from '../providers/identity'
import teamProvider from '../providers/team'
import contestProvider from '../providers/contest'
import taskProvider from '../providers/task'
import History from 'history.js'
import metadataStore from '../utils/metadata-store'
import 'parsley'
import 'jquery.form'
import 'bootstrap-filestyle'


class ProfileView extends View {
  constructor() {
    super(/^\/profile\/[0-9]+$/)
    this.$main = null
    this.team = null
  }

  getTitle() {
    return `${metadataStore.getMetadata('event-title')} :: Team profile`
  }

  initUploadLogoModal() {
    let $buttonUploadLogo = this.$main.find('a[data-action="upload-logo"]')

    if ($buttonUploadLogo.length) {
      let $uploadLogoModal = $('#upload-logo-modal')
      $uploadLogoModal.modal({ show: false })

      let $uploadLogoSubmitError = $uploadLogoModal.find('.submit-error > p')
      let $uploadLogoSubmitButton = $uploadLogoModal.find('button[data-action="complete-upload-logo"]')
      let $uploadLogoForm = $uploadLogoModal.find('form')
      $uploadLogoForm.find('input:file').filestyle()
      $uploadLogoForm.parsley()

      $uploadLogoSubmitButton.on('click', (e) => {
        $uploadLogoForm.trigger('submit')
      })

      $uploadLogoModal.on('show.bs.modal', (e) => {
        $uploadLogoForm.find('input:file').filestyle('clear')
        $uploadLogoForm.parsley().reset()
      })

      $uploadLogoForm.on('submit', (e) => {
        e.preventDefault()
        $uploadLogoForm.ajaxSubmit({
          beforeSubmit: () => {
            $uploadLogoSubmitError.text('')
            $uploadLogoSubmitButton.prop('disabled', true)
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
            let onTimeout = () => {
              $uploadLogoModal.modal('hide')
              window.location.reload()
            }

            setTimeout(onTimeout, 1500)
          },
          error: (jqXHR, textStatus, errorThrown) => {
            if (jqXHR.responseJSON) {
              $uploadLogoSubmitError.text(jqXHR.responseJSON)
            } else {
              $uploadLogoSubmitError.text('Unknown error. Please try again later.')
            }
          },
          complete: () => {
            $uploadLogoSubmitButton.prop('disabled', false)
          }
        })
      })
    }
  }

  initChangeEmailModal() {
    let $buttonChangeEmail = this.$main.find('button[data-action="change-email"]')
    if ($buttonChangeEmail.length) {
      let $changeEmailModal = $('#change-email-modal')
      $changeEmailModal.modal({ show: false })

      let $changeEmailSubmitError = $changeEmailModal.find('.submit-error > p')
      let $changeEmailSubmitButton = $changeEmailModal.find('button[data-action="complete-change-email"]')
      let $changeEmailForm = $changeEmailModal.find('form')
      $changeEmailForm.parsley()

      $changeEmailSubmitButton.on('click', (e) => {
        $changeEmailForm.trigger('submit')
      })

      $changeEmailModal.on('show.bs.modal', (e) => {
        $('#change-email-new').val('')
        $changeEmailSubmitError.text('')
        $changeEmailForm.parsley().reset()
      })

      $changeEmailModal.on('shown.bs.modal', (e) => {
        $('#change-email-new').focus()
      })

      $changeEmailForm.on('submit', (e) => {
        e.preventDefault()
        $changeEmailForm.ajaxSubmit({
          beforeSubmit: () => {
            $changeEmailSubmitError.text('')
            $changeEmailSubmitButton.prop('disabled', true)
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
            $changeEmailModal.modal('hide')
            window.location.reload()
          },
          error: (jqXHR, textStatus, errorThrown) => {
            if (jqXHR.responseJSON) {
              $changeEmailSubmitError.text(jqXHR.responseJSON)
            } else {
              $changeEmailSubmitError.text('Unknown error. Please try again later.')
            }
          },
          complete: () => {
            $changeEmailSubmitButton.prop('disabled', false)
          }
        })
      })
    }
  }

  initResendConfirmationModal() {
    let $buttonResendConfirmation = this.$main.find('button[data-action="resend-confirmation"]')
    if ($buttonResendConfirmation.length) {
      let $resendConfirmationModal = $('#resend-confirmation-modal')
      $resendConfirmationModal.modal({ show: false })

      let $resendConfirmationSubmitError = $resendConfirmationModal.find('.submit-error > p')
      let $resendConfirmationSubmitButton = $resendConfirmationModal.find('button[data-action="complete-resend-confirmation"]')
      let $resendConfirmationForm = $resendConfirmationModal.find('form')

      $resendConfirmationSubmitButton.on('click', (e) => {
        $resendConfirmationForm.trigger('submit')
      })

      $resendConfirmationModal.on('show.bs.modal', (e) => {
        $('#resend-confirmation-email').val(this.team.email)
        $resendConfirmationSubmitError.text('')
      })

      $resendConfirmationModal.on('shown.bs.modal', (e) => {
        $('#resend-confirmation-email').focus()
      })

      $resendConfirmationForm.on('submit', (e) => {
        e.preventDefault()
        $resendConfirmationForm.ajaxSubmit({
          beforeSubmit: () => {
            $resendConfirmationSubmitError.text('')
            $resendConfirmationSubmitButton.prop('disabled', true)
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
            $resendConfirmationModal.modal('hide')
            window.location.reload()
          },
          error: (jqXHR, textStatus, errorThrown) => {
            if (jqXHR.responseJSON) {
              $resendConfirmationSubmitError.text(jqXHR.responseJSON)
            } else {
              $resendConfirmationSubmitError.text('Unknown error. Please try again later.')
            }
          },
          complete: () => {
            $resendConfirmationSubmitButton.prop('disabled', false)
          }
        })
      })
    }
  }

  initEditProfileModal() {
    let $buttonEditProfile = this.$main.find('button[data-action="edit-profile"]')
    if ($buttonEditProfile.length) {
      let $editProfileModal = $('#edit-profile-modal')
      $editProfileModal.modal({ show: false })

      let $editProfileSubmitError = $editProfileModal.find('.submit-error > p')
      let $editProfileSubmitButton = $editProfileModal.find('button[data-action="complete-edit-profile"]')
      let $editProfileForm = $editProfileModal.find('form')
      $editProfileForm.parsley()

      $editProfileSubmitButton.on('click', (e) => {
        $editProfileForm.trigger('submit')
      })

      $editProfileModal.on('show.bs.modal', (e) => {
        $('#edit-profile-country').val(this.team.country).focus()
        $('#edit-profile-locality').val(this.team.locality)
        $('#edit-profile-institution').val(this.team.institution)
        $editProfileSubmitError.text('')
      })

      $editProfileModal.on('shown.bs.modal', (e) => {
        $('#edit-profile-country').focus()
      })

      $editProfileForm.on('submit', (e) => {
        e.preventDefault()
        $editProfileForm.ajaxSubmit({
          beforeSubmit: () => {
            $editProfileSubmitError.text('')
            $editProfileSubmitButton.prop('disabled', true)
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
            $editProfileModal.modal('hide')
            window.location.reload()
          },
          error: (jqXHR, textStatus, errorThrown) => {
            if (jqXHR.responseJSON) {
              $editProfileSubmitError.text(jqXHR.responseJSON)
            } else {
              $editProfileSubmitError.text('Unknown error. Please try again later.')
            }
          },
          complete: () => {
            $editProfileSubmitButton.prop('disabled', false)
          }
        })
      })
    }
  }

  initChangePasswordModal() {
    let $buttonChangePassword = this.$main.find('button[data-action="change-password"]')
    if ($buttonChangePassword.length) {
      let $changePasswordModal = $('#change-password-modal')
      $changePasswordModal.modal({ show: false })

      let $changePasswordSubmitError = $changePasswordModal.find('.submit-error > p')
      let $changePasswordSubmitButton = $changePasswordModal.find('button[data-action="complete-change-password"]')
      let $changePasswordForm = $changePasswordModal.find('form')
      $changePasswordForm.parsley()

      $changePasswordSubmitButton.on('click', (e) => {
        $changePasswordForm.trigger('submit')
      })

      $changePasswordModal.on('show.bs.modal', (e) => {
        $('#change-pwd-current').val('')
        $('#change-pwd-new').val('')
        $('#change-pwd-confirm-new').val('')
        $changePasswordSubmitError.text('')
        $changePasswordForm.parsley().reset()
      })

      $changePasswordModal.on('shown.bs.modal', (e) => {
        $('#change-pwd-current').focus()
      })

      $changePasswordForm.on('submit', (e) => {
        e.preventDefault()
        $changePasswordForm.ajaxSubmit({
          beforeSubmit: () => {
            $changePasswordSubmitError.text('')
            $changePasswordSubmitButton.prop('disabled', true)
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
            $changePasswordModal.modal('hide')
          },
          error: (jqXHR, textStatus, errorThrown) => {
            if (jqXHR.responseJSON) {
              $changePasswordSubmitError.text(jqXHR.responseJSON)
            } else {
              $changePasswordSubmitError.text('Unknown error. Please try again later.')
            }
          },
          complete: () => {
            $changePasswordSubmitButton.prop('disabled', false)
          }
        })
      })
    }
  }

  present() {
    this.$main = $('#main')
    this.$main.html(renderTemplate('profile-view'))

    $
      .when(identityProvider.fetchIdentity())
      .done((identity) => {
        identityProvider.subscribe()
        navigationBar.present()

        let url = History.getState().data.urlPath
        let urlParts = url.split('/')
        let teamId = parseInt(urlParts[urlParts.length - 1], 10)
        let promise = null

        if (_.contains(['admin', 'manager'], identity.role) || (identity.role === 'team' && identity.id === teamId)) {
          promise = $.when(teamProvider.fetchTeamProfile(teamId), contestProvider.fetchTeamTaskProgress(teamId), taskProvider.fetchTaskPreviews())
        } else {
          promise = $.when(teamProvider.fetchTeamProfile(teamId), contestProvider.fetchTeamTaskProgress(teamId))
        }

        promise
          .done((team, teamTaskProgress) => {
            this.team = team
            let opts = {
              identity: identity,
              team: team
            }

            if (_.contains(['admin', 'manager'], identity.role) || (identity.role === 'team' && identity.id === teamId)) {
              let tasks = taskProvider.getTaskPreviews()
              let taskNames = []

              for (let entry of teamTaskProgress) {
                let task = _.findWhere(tasks, { id: entry.taskId })
                if (task && !_.contains(taskNames, task.title)) {
                  taskNames.push(task.title)
                }
              }

              opts.teamProgressInfo = renderTemplate('team-progress-partial', {
                identity: identity,
                teamId: team.id,
                taskNames: taskNames
              })
            } else {
              opts.teamProgressInfo = renderTemplate('team-progress-partial', {
                identity: identity,
                teamId: team.id,
                count: teamTaskProgress
              })
            }

            this.$main.find('section').html(renderTemplate('team-profile-partial', opts))
            if (identity.role === 'team' && identity.id === team.id) {
              this.initUploadLogoModal()

              if (!identity.emailConfirmed) {
                this.initResendConfirmationModal()
                this.initChangeEmailModal()
              }

              this.initEditProfileModal()
              this.initChangePasswordModal()
            }
          })
          .fail((err) => {
            this.$main.html(renderTemplate('internal-error-view'))
          })
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
    this.team = null
    navigationBar.dismiss()
  }
}


export default new ProfileView()
