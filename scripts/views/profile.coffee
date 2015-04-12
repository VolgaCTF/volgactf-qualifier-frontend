define 'profileView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'metadataStore', 'jquery.history', 'parsley', 'jquery.form', 'bootstrap-filestyle'], ($, View, renderTemplate, dataStore, navigationBar, metadataStore, History) ->
    class ProfileView extends View
        constructor: ->
            @$main = null
            @identity = null
            @team = null

            @urlRegex = /^\/profile\/[0-9]+$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: Team profile"

        initUploadLogoModal: ->
            $buttonUploadLogo = @$main.find 'a[data-action="upload-logo"]'

            if $buttonUploadLogo.length
                $uploadLogoModal = $ '#upload-logo-modal'
                $uploadLogoModal.modal
                    show: no

                $uploadLogoSubmitError = $uploadLogoModal.find '.submit-error > p'
                $uploadLogoSubmitButton = $uploadLogoModal.find 'button[data-action="complete-upload-logo"]'
                $uploadLogoForm = $uploadLogoModal.find 'form'
                $uploadLogoForm.find('input:file').filestyle()
                $uploadLogoForm.parsley()

                $uploadLogoSubmitButton.on 'click', (e) ->
                    $uploadLogoForm.trigger 'submit'

                $uploadLogoModal.on 'show.bs.modal', (e) ->
                    $uploadLogoForm.find('input:file').filestyle 'clear'

                $uploadLogoForm.on 'submit', (e) =>
                    e.preventDefault()
                    $uploadLogoForm.ajaxSubmit
                        beforeSubmit: ->
                            $uploadLogoSubmitError.text ''
                            $uploadLogoSubmitButton.prop 'disabled', yes
                        clearForm: yes
                        dataType: 'json'
                        xhrFields:
                            withCredentials: yes
                        headers: { 'X-CSRF-Token': @identity.token }
                        success: (responseText, textStatus, jqXHR) ->
                            onTimeout = ->
                                $uploadLogoModal.modal 'hide'
                                window.location.reload()

                            setTimeout onTimeout, 1500
                        error: (jqXHR, textStatus, errorThrown) ->
                            if jqXHR.responseJSON?
                                $uploadLogoSubmitError.text jqXHR.responseJSON
                            else
                                $uploadLogoSubmitError.text 'Unknown error. Please try again later.'
                        complete: ->
                            $uploadLogoSubmitButton.prop 'disabled', no


        initChangeEmailModal: ->
            $buttonChangeEmail = @$main.find 'button[data-action="change-email"]'
            if $buttonChangeEmail.length
                $changeEmailModal = $ '#change-email-modal'
                $changeEmailModal.modal
                    show: no

                $changeEmailSubmitError = $changeEmailModal.find '.submit-error > p'
                $changeEmailSubmitButton = $changeEmailModal.find 'button[data-action="complete-change-email"]'
                $changeEmailForm = $changeEmailModal.find 'form'
                $changeEmailForm.parsley()

                $changeEmailSubmitButton.on 'click', (e) ->
                    $changeEmailForm.trigger 'submit'

                $changeEmailModal.on 'show.bs.modal', (e) ->
                    $('#change-email-new').val ''
                    $changeEmailSubmitError.text ''

                $changeEmailModal.on 'shown.bs.modal', (e) ->
                    $('#change-email-new').focus()

                $changeEmailForm.on 'submit', (e) =>
                    e.preventDefault()
                    $changeEmailForm.ajaxSubmit
                        beforeSubmit: ->
                            $changeEmailSubmitError.text ''
                            $changeEmailSubmitButton.prop 'disabled', yes
                        clearForm: yes
                        dataType: 'json'
                        xhrFields:
                            withCredentials: yes
                        headers: { 'X-CSRF-Token': @identity.token }
                        success: (responseText, textStatus, jqXHR) ->
                            $changeEmailModal.modal 'hide'
                            window.location.reload()
                        error: (jqXHR, textStatus, errorThrown) ->
                            if jqXHR.responseJSON?
                                $changeEmailSubmitError.text jqXHR.responseJSON
                            else
                                $changeEmailSubmitError.text 'Unknown error. Please try again later.'
                        complete: ->
                            $changeEmailSubmitButton.prop 'disabled', no


        initResendConfirmationModal: ->
            $buttonResendConfirmation = @$main.find 'button[data-action="resend-confirmation"]'
            if $buttonResendConfirmation.length
                $resendConfirmationModal = $ '#resend-confirmation-modal'
                $resendConfirmationModal.modal
                    show: no

                $resendConfirmationSubmitError = $resendConfirmationModal.find '.submit-error > p'
                $resendConfirmationSubmitButton = $resendConfirmationModal.find 'button[data-action="complete-resend-confirmation"]'
                $resendConfirmationForm = $resendConfirmationModal.find 'form'

                $resendConfirmationSubmitButton.on 'click', (e) ->
                    $resendConfirmationForm.trigger 'submit'

                $resendConfirmationModal.on 'show.bs.modal', (e) =>
                    $('#resend-confirmation-email').val @team.email
                    $resendConfirmationSubmitError.text ''

                $resendConfirmationModal.on 'shown.bs.modal', (e) ->
                    $('#resend-confirmation-email').focus()

                $resendConfirmationForm.on 'submit', (e) =>
                    e.preventDefault()
                    $resendConfirmationForm.ajaxSubmit
                        beforeSubmit: ->
                            $resendConfirmationSubmitError.text ''
                            $resendConfirmationSubmitButton.prop 'disabled', yes
                        clearForm: yes
                        dataType: 'json'
                        xhrFields:
                            withCredentials: yes
                        headers: { 'X-CSRF-Token': @identity.token }
                        success: (responseText, textStatus, jqXHR) ->
                            $resendConfirmationModal.modal 'hide'
                            window.location.reload()
                        error: (jqXHR, textStatus, errorThrown) ->
                            if jqXHR.responseJSON?
                                $resendConfirmationSubmitError.text jqXHR.responseJSON
                            else
                                $resendConfirmationSubmitError.text 'Unknown error. Please try again later.'
                        complete: ->
                            $resendConfirmationSubmitButton.prop 'disabled', no


        initEditProfileModal: ->
            $buttonEditProfile = @$main.find 'button[data-action="edit-profile"]'
            if $buttonEditProfile.length
                $editProfileModal = $ '#edit-profile-modal'
                $editProfileModal.modal
                    show: no

                $editProfileSubmitError = $editProfileModal.find '.submit-error > p'
                $editProfileSubmitButton = $editProfileModal.find 'button[data-action="complete-edit-profile"]'
                $editProfileForm = $editProfileModal.find 'form'
                $editProfileForm.parsley()

                $editProfileSubmitButton.on 'click', (e) ->
                    $editProfileForm.trigger 'submit'

                $editProfileModal.on 'show.bs.modal', (e) =>
                    $('#edit-profile-country').val(@team.country).focus()
                    $('#edit-profile-locality').val @team.locality
                    $('#edit-profile-institution').val @team.institution
                    $editProfileSubmitError.text ''

                $editProfileModal.on 'shown.bs.modal', (e) ->
                    $('#edit-profile-country').focus()

                $editProfileForm.on 'submit', (e) =>
                    e.preventDefault()
                    $editProfileForm.ajaxSubmit
                        beforeSubmit: ->
                            $editProfileSubmitError.text ''
                            $editProfileSubmitButton.prop 'disabled', yes
                        clearForm: yes
                        dataType: 'json'
                        xhrFields:
                            withCredentials: yes
                        headers: { 'X-CSRF-Token': @identity.token }
                        success: (responseText, textStatus, jqXHR) ->
                            $editProfileModal.modal 'hide'
                            window.location.reload()
                        error: (jqXHR, textStatus, errorThrown) ->
                            if jqXHR.responseJSON?
                                $editProfileSubmitError.text jqXHR.responseJSON
                            else
                                $editProfileSubmitError.text 'Unknown error. Please try again later.'
                        complete: ->
                            $editProfileSubmitButton.prop 'disabled', no


        initChangePasswordModal: ->
            $buttonChangePassword = @$main.find 'button[data-action="change-password"]'
            if $buttonChangePassword.length
                $changePasswordModal = $ '#change-password-modal'
                $changePasswordModal.modal
                    show: no

                $changePasswordSubmitError = $changePasswordModal.find '.submit-error > p'
                $changePasswordSubmitButton = $changePasswordModal.find 'button[data-action="complete-change-password"]'
                $changePasswordForm = $changePasswordModal.find 'form'
                $changePasswordForm.parsley()

                $changePasswordSubmitButton.on 'click', (e) ->
                    $changePasswordForm.trigger 'submit'

                $changePasswordModal.on 'show.bs.modal', (e) ->
                    $('#change-pwd-current').val ''
                    $('#change-pwd-new').val ''
                    $('#change-pwd-confirm-new').val ''
                    $changePasswordSubmitError.text ''

                $changePasswordModal.on 'shown.bs.modal', (e) ->
                    $('#change-pwd-current').focus()

                $changePasswordForm.on 'submit', (e) =>
                    e.preventDefault()
                    $changePasswordForm.ajaxSubmit
                        beforeSubmit: ->
                            $changePasswordSubmitError.text ''
                            $changePasswordSubmitButton.prop 'disabled', yes
                        clearForm: yes
                        dataType: 'json'
                        xhrFields:
                            withCredentials: yes
                        headers: { 'X-CSRF-Token': @identity.token }
                        success: (responseText, textStatus, jqXHR) ->
                            $changePasswordModal.modal 'hide'
                        error: (jqXHR, textStatus, errorThrown) ->
                            if jqXHR.responseJSON?
                                $changePasswordSubmitError.text jqXHR.responseJSON
                            else
                                $changePasswordSubmitError.text 'Unknown error. Please try again later.'
                        complete: ->
                            $changePasswordSubmitButton.prop 'disabled', no


        present: ->
            @$main = $ '#main'
            @$main.html renderTemplate 'profile-view'

            dataStore.getIdentity (err, identity) =>
                if err?
                    @$main.html renderTemplate 'internal-error'
                    navigationBar.present()
                else
                    @identity = identity

                    navigationBar.present
                        identity: identity

                    url = History.getState().data.urlPath
                    urlParts = url.split '/'
                    teamId = parseInt urlParts[urlParts.length - 1], 10
                    dataStore.getTeamProfile teamId, (err, team) =>
                        if err? or not team?
                            @$main.html renderTemplate 'internal-error'
                        else
                            @team = team
                            @$main.find('section').html renderTemplate 'team-profile-partial', identity: identity, team: team
                            if identity.role is 'team' and identity.id == team.id
                                @initUploadLogoModal()

                                if not identity.emailConfirmed
                                    @initResendConfirmationModal()
                                    @initChangeEmailModal()

                                @initEditProfileModal()
                                @initChangePasswordModal()

        dismiss: ->
            @$main.empty()
            @$main = null
            @identity = null
            @team = null

            navigationBar.dismiss()


    new ProfileView()
