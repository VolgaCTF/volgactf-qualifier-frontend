import $ from 'jquery'
import _ from 'underscore'
import View from './base'
import dataStore from '../data-store'
import moment from 'moment'
import remoteCheckerProvider from '../providers/remote-checker'
import contestProvider from '../providers/contest'
import identityProvider from '../providers/identity'
import 'bootstrap'
import 'jquery-form'
import 'parsley'

class RemoteCheckersView extends View {
  constructor () {
    super()
    this.$main = null

    this.onCreateRemoteChecker = null
    this.onUpdateRemoteChecker = null
    this.onDeleteRemoteChecker = null

    this.onUpdateContest = null
  }

  initCreateRemoteCheckerModal () {
    let $modal = $('#create-remote-checker-modal')
    $modal.modal({ show: false })

    let $submitError = $modal.find('.submit-error > p')
    let $submitButton = $modal.find('button[data-action="complete-create-remote-checker"]')
    let $form = $modal.find('form')
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
      $submitError.text('')
      $form.parsley().reset()
    })

    $modal.on('shown.bs.modal', (e) => {
      $('#create-remote-checker-name').focus()
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
          if (!dataStore.connectedRealtime()) {
            window.location.reload()
          }
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

  initEditRemoteCheckerModal () {
    let $modal = $('#edit-remote-checker-modal')
    $modal.modal({ show: false })

    let $submitError = $modal.find('.submit-error > p')
    let $submitButton = $modal.find('button[data-action="complete-edit-remote-checker"]')
    let $form = $modal.find('form')
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

    let $editRemoteCheckerName = $('#edit-remote-checker-name')
    let $editRemoteCheckerUrl = $('#edit-remote-checker-url')
    let $editRemoteCheckerAuthUsername = $('#edit-remote-checker-auth-username')
    let $editRemoteCheckerAuthPassword = $('#edit-remote-checker-auth-password')

    $modal.on('show.bs.modal', (e) => {
      let remoteCheckerId = parseInt($(e.relatedTarget).data('remote-checker-id'), 10)
      let remoteChecker = _.findWhere(remoteCheckerProvider.getRemoteCheckers(), { id: remoteCheckerId })

      $form.attr('action', `/api/remote_checker/${remoteCheckerId}/update`)
      $editRemoteCheckerName.val(remoteChecker.name)
      $editRemoteCheckerUrl.val(remoteChecker.url)
      $editRemoteCheckerAuthUsername.val(remoteChecker.authUsername)
      $editRemoteCheckerAuthPassword.val('')
      $submitError.text('')
      $form.parsley().reset()
    })

    $modal.on('shown.bs.modal', (e) => {
      $editRemoteCheckerName.focus()
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
          if (!dataStore.connectedRealtime()) {
            window.location.reload()
          }
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

  initDeleteRemoteCheckerModal () {
    let $modal = $('#delete-remote-checker-modal')
    $modal.modal({ show: false })

    let $modalBody = $modal.find('.modal-body p.confirmation')
    let $submitError = $modal.find('.submit-error > p')
    let $submitButton = $modal.find('button[data-action="complete-delete-remote-checker"]')

    $modal.on('show.bs.modal', (e) => {
      let remoteCheckerId = parseInt($(e.relatedTarget).data('remote-checker-id'), 10)
      $modal.data('remote-checker-id', remoteCheckerId)
      let remoteChecker = _.findWhere(remoteCheckerProvider.getRemoteCheckers(), { id: remoteCheckerId })
      const msgTemplate = _.template('You are about to delete the remote checker <mark><%- name %></mark>. Continue?')
      $modalBody.html(msgTemplate({ name: remoteChecker.name }))
      $submitError.text('')
    })

    $submitButton.on('click', (e) => {
      const remoteCheckerId = $modal.data('remote-checker-id')
      $
      .when(
        remoteCheckerProvider.deleteRemoteChecker(
          remoteCheckerId,
          identityProvider.getIdentity().token
        )
      )
      .done(() => {
        $modal.modal('hide')
        if (!dataStore.connectedRealtime()) {
          window.location.reload()
        }
      })
      .fail((err) => {
        $submitError.text(err)
      })
    })
  }

  renderRemoteCheckers () {
    $('#themis-quals-remote-checker-list').html(window.themis.quals.templates.remoteCheckerList({
      _: _,
      identity: identityProvider.getIdentity(),
      contest: contestProvider.getContest(),
      remoteCheckers: remoteCheckerProvider.getRemoteCheckers(),
      templates: window.themis.quals.templates,
      moment: moment
    }))
  }

  present () {
    this.$main = $('#main')

    $
    .when(
      remoteCheckerProvider.initRemoteCheckers()
    )
    .done(() => {
      const identity = identityProvider.getIdentity()
      if (identity.isAdmin()) {
        this.initCreateRemoteCheckerModal()
        this.initEditRemoteCheckerModal()
        this.initDeleteRemoteCheckerModal()
      }

      this.onCreateRemoteChecker = () => {
        this.renderRemoteCheckers()
        return false
      }

      this.onUpdateRemoteChecker = () => {
        this.renderRemoteCheckers()
        return false
      }

      this.onDeleteRemoteChecker = () => {
        this.renderRemoteCheckers()
        return false
      }

      remoteCheckerProvider.subscribe()
      remoteCheckerProvider.on('createRemoteChecker', this.onCreateRemoteChecker)
      remoteCheckerProvider.on('updateRemoteChecker', this.onUpdateRemoteChecker)
      remoteCheckerProvider.on('deleteRemoteChecker', this.onDeleteRemoteChecker)

      this.onUpdateContest = (contest) => {
        this.renderRemoteCheckers()
        return false
      }

      contestProvider.on('updateContest', this.onUpdateContest)
    })
  }
}

export default new RemoteCheckersView()
