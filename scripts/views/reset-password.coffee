define 'resetPasswordView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'metadataStore', 'identityProvider', 'jquery.history', 'parsley', 'jquery.form'], ($, View, renderTemplate, dataStore, navigationBar, metadataStore, identityProvider, History) ->
    class ResetPasswordView extends View
        constructor: ->
            @$main = null
            @urlRegex = /^\/reset-password$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: Reset password"

        present: ->
            @$main = $ '#main'

            $
                .when identityProvider.fetchIdentity()
                .done (identity) =>
                    identityProvider.subscribe()
                    navigationBar.present()

                    @$main.html renderTemplate 'reset-password-view', identity: identity

                    $form = @$main.find 'form.themis-form-reset'
                    $form.parsley()
                    $submitError = $form.find '.submit-error > p'
                    $submitButton = $form.find 'button'

                    $successAlert = @$main.find 'div.themis-reset-success'
                    $errorAlert = @$main.find 'div.themis-reset-error'

                    urlParams = History.getState().data.params
                    if urlParams.team? and urlParams.code?
                        $form.show()

                        $form.on 'submit', (e) =>
                            e.preventDefault()
                            $form.ajaxSubmit
                                beforeSubmit: ->
                                    $submitError.text ''
                                    $submitButton.prop 'disabled', yes
                                clearForm: yes
                                dataType: 'json'
                                data:
                                    team: urlParams.team
                                    code: urlParams.code
                                xhrFields:
                                    withCredentials: yes
                                headers: { 'X-CSRF-Token': identityProvider.getIdentity().token }
                                success: (responseText, textStatus, jqXHR) ->
                                    $form.hide()
                                    $successAlert.show()
                                error: (jqXHR, textStatus, errorThrown) ->
                                    if jqXHR.responseJSON?
                                        $submitError.text jqXHR.responseJSON
                                    else
                                        $submitError.text 'Unknown error. Please try again later.'
                                complete: ->
                                    $submitButton.prop 'disabled', no
                    else
                        $errorAlert.show()
                .fail (err) =>
                    navigationBar.present()
                    @$main.html renderTemplate 'internal-error-view'

        dismiss: ->
            identityProvider.unsubscribe()
            @$main.empty()
            @$main = null
            navigationBar.dismiss()

    new ResetPasswordView()
