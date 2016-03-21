import $ from 'jquery'
import _ from 'underscore'
import View from '../base'
import renderTemplate from '../../utils/render-template'
import navigationBar from '../../navigation-bar'
import statusBar from '../../status-bar'
import dataStore from '../../data-store'
import identityProvider from '../../providers/identity'
import teamProvider from '../../providers/team'
import contestProvider from '../../providers/contest'
import countryProvider from '../../providers/country'
import taskProvider from '../../providers/task'
import History from 'history.js'
import metadataStore from '../../utils/metadata-store'
import teamTaskHitProvider from '../../providers/team-task-hit'
import teamTaskReviewProvider from '../../providers/team-task-review'
import moment from 'moment'
import 'parsley'
import 'jquery.form'
import 'bootstrap-filestyle'

class TeamProfileView extends View {
  constructor () {
    super(/^\/team\/[0-9]{1,5}\/profile$/)
    this.$main = null
    this.team = null
  }

  getTitle () {
    return `${metadataStore.getMetadata('event-title')} :: Team profile`
  }

  initUploadLogoModal () {
    let $button = this.$main.find('a[data-action="upload-logo"]')

    if ($button.length) {
      let $modal = $('#upload-logo-modal')
      $modal.modal({ show: false })

      let $submitError = $modal.find('.submit-error > p')
      let $submitButton = $modal.find('button[data-action="complete-upload-logo"]')
      let $form = $modal.find('form')
      $form.find('input:file').filestyle()
      $form.parsley()

      $submitButton.on('click', (e) => {
        $form.trigger('submit')
      })

      $modal.on('show.bs.modal', (e) => {
        $form.find('input:file').filestyle('clear')
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
            let onTimeout = () => {
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
    let $button = this.$main.find('button[data-action="change-email"]')

    if ($button.length) {
      let $modal = $('#change-email-modal')
      $modal.modal({ show: false })

      let $submitError = $modal.find('.submit-error > p')
      let $submitButton = $modal.find('button[data-action="complete-change-email"]')
      let $form = $modal.find('form')
      $form.parsley()

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
    let $button = this.$main.find('button[data-action="resend-confirmation"]')

    if ($button.length) {
      let $modal = $('#resend-confirmation-modal')
      $modal.modal({ show: false })

      let $submitError = $modal.find('.submit-error > p')
      let $submitSuccess = $modal.find('.submit-success > p')
      let $submitButton = $modal.find('button[data-action="complete-resend-confirmation"]')
      let $form = $modal.find('form')

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
            let hideModal = () => {
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
    let $button = this.$main.find('button[data-action="edit-profile"]')

    if ($button.length) {
      let $modal = $('#edit-profile-modal')
      $modal.modal({ show: false })

      let $submitError = $modal.find('.submit-error > p')
      let $submitButton = $modal.find('button[data-action="complete-edit-profile"]')
      let $form = $modal.find('form')
      $form.parsley()

      let $countrySelect = $('#edit-profile-country')
      for (let country of countryProvider.getCountries()) {
        $countrySelect.append($('<option></option>').attr('value', country.id).text(country.getFullName()))
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

  initChangePasswordModal () {
    let $button = this.$main.find('button[data-action="change-password"]')

    if ($button.length) {
      let $modal = $('#change-password-modal')
      $modal.modal({ show: false })

      let $submitError = $modal.find('.submit-error > p')
      let $submitSuccess = $modal.find('.submit-success > p')
      let $submitButton = $modal.find('button[data-action="complete-change-password"]')
      let $form = $modal.find('form')

      let $currentPassword = $('#change-pwd-current')
      let $newPassword = $('#change-pwd-new')
      let $confirmNewPassword = $('#change-pwd-confirm-new')

      $form.parsley()

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
            let hideModal = () => {
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

  present () {
    this.$main = $('#main')
    this.$main.html(renderTemplate('loading-view'))

    $
      .when(identityProvider.fetchIdentity(), contestProvider.fetchContest())
      .done((identity, contest) => {
        let url = History.getState().data.urlPath
        let urlParts = url.split('/')
        let teamId = parseInt(urlParts[urlParts.length - 2], 10)
        let promise = null

        if (identity.isSupervisor()) {
          if (contest.isInitial()) {
            promise = $.when(
              teamProvider.fetchTeamProfile(teamId),
              countryProvider.fetchCountries()
            )
          } else {
            promise = $.when(
              teamProvider.fetchTeamProfile(teamId),
              countryProvider.fetchCountries(),
              teamTaskHitProvider.fetchTeamHits(teamId),
              teamTaskReviewProvider.fetchTeamReviews(teamId),
              taskProvider.fetchTaskPreviews()
            )
          }
        } else if (identity.isExactTeam(teamId)) {
          if (contest.isInitial()) {
            promise = $.when(
              teamProvider.fetchTeamProfile(teamId),
              countryProvider.fetchCountries()
            )
          } else {
            promise = $.when(
              teamProvider.fetchTeamProfile(teamId),
              countryProvider.fetchCountries(),
              teamTaskHitProvider.fetchTeamHits(teamId),
              teamTaskReviewProvider.fetchTeamReviews(teamId),
              contestProvider.fetchTeamScores(),
              taskProvider.fetchTaskPreviews()
            )
          }
        } else if (identity.isTeam()) {
          if (contest.isInitial()) {
            promise = $.when(
              teamProvider.fetchTeamProfile(teamId),
              countryProvider.fetchCountries()
            )
          } else {
            promise = $.when(
              teamProvider.fetchTeamProfile(teamId),
              countryProvider.fetchCountries(),
              teamTaskHitProvider.fetchTeamHitStatistics(teamId),
              teamTaskReviewProvider.fetchTeamReviewStatistics(teamId),
              contestProvider.fetchTeamScores()
            )
          }
        } else {
          if (contest.isInitial()) {
            promise = $.when(
              teamProvider.fetchTeamProfile(teamId),
              countryProvider.fetchCountries()
            )
          } else {
            promise = $.when(
              teamProvider.fetchTeamProfile(teamId),
              countryProvider.fetchCountries(),
              teamTaskHitProvider.fetchTeamHitStatistics(teamId),
              teamTaskReviewProvider.fetchTeamReviewStatistics(teamId)
            )
          }
        }

        promise
          .done((team, countries, teamTaskHits, teamTaskReviews) => {
            identityProvider.subscribe()

            if (dataStore.supportsRealtime()) {
              dataStore.connectRealtime()
            }

            navigationBar.present()
            statusBar.present()

            this.$main.html(renderTemplate('profile-view', {
              identity: identity,
              team: team
            }))

            this.team = team
            let opts = {
              identity: identity,
              team: team,
              tasks: null,
              taskHits: null,
              taskReviews: null,
              teamHitStatistics: null,
              teamReviewStatistics: null,
              utils: {
                underscore: _,
                moment: moment
              }
            }

            let country = _.findWhere(countries, { id: team.countryId })
            opts.country = country.name

            if (!contest.isInitial()) {
              if (identity.isSupervisor() || identity.isExactTeam(teamId)) {
                opts.tasks = taskProvider.getTaskPreviews()
                opts.taskHits = teamTaskHits
                opts.taskReviews = teamTaskReviews
              } else {
                opts.teamHitStatistics = teamTaskHits
                opts.teamReviewStatistics = teamTaskReviews
              }
            }

            this.$main.find('section').html(renderTemplate('team-profile-partial', opts))
            if (identity.isExactTeam(team.id)) {
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
            console.error(err)
            this.$main.html(renderTemplate('internal-error-view'))
          })
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
    this.team = null
    navigationBar.dismiss()
    statusBar.dismiss()

    if (dataStore.supportsRealtime()) {
      dataStore.disconnectRealtime()
    }
  }
}

export default new TeamProfileView()
