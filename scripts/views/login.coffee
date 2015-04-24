define 'loginView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'stateController', 'metadataStore', 'identityProvider', 'parsley', 'jquery.form'], ($, View, renderTemplate, dataStore, navigationBar, stateController, metadataStore, identityProvider) ->
    class LoginView extends View
        constructor: ->
            @$main = null
            @urlRegex = /^\/login$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: Login"

        initLoginForm: ->
            $form = @$main.find 'form.themis-form-login'
            $form.parsley()

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
                        stateController.navigateTo '/'
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
                        @$main.html renderTemplate 'login-view'
                        @initLoginForm()
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

    new LoginView()
