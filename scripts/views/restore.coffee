define 'restoreView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'stateController', 'metadataStore', 'identityProvider', 'parsley', 'jquery.form'], ($, View, renderTemplate, dataStore, navigationBar, stateController, metadataStore, identityProvider) ->
    class RestoreView extends View
        constructor: ->
            @$main = null
            @urlRegex = /^\/restore$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: Restore password"

        initRestoreForm: ->
            $form = @$main.find 'form.themis-form-restore'
            $form.parsley()

            $form.find('input[name="email"]').focus()

            $successAlert = @$main.find 'div.themis-alert-restore'

            $submitError = $form.find '.submit-error > p'
            $submitButton = $form.find 'button'

            $form.on 'submit', (e) =>
                e.preventDefault()
                $form.ajaxSubmit
                    beforeSubmit: ->
                        $submitError.text ''
                        $submitButton.prop 'disabled', yes
                    clearForm: yes
                    dataType: 'json'
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

        present: ->
            @$main = $ '#main'

            $
                .when identityProvider.fetchIdentity()
                .done (identity) =>
                    identityProvider.subscribe()

                    navigationBar.present()

                    if identity.role == 'guest'
                        @$main.html renderTemplate 'restore-view'
                        @initRestoreForm()
                    else
                        @$main.html renderTemplate 'already-authenticated-view'
                .fail (err) =>
                    navigationBar.present()
                    @$main.html renderTemplate 'internal-error-view'

        dismiss: ->
            identityProvider.unsubscribe()
            @$main.empty()
            @$main = null
            navigationBar.dismiss()

    new RestoreView()
