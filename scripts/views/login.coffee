define 'loginView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'stateController', 'metadataStore', 'parsley', 'jquery.form'], ($, View, renderTemplate, dataStore, navigationBar, stateController, metadataStore) ->
    class LoginView extends View
        constructor: ->
            @$main = null
            @identity = null
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
                    headers: { 'X-CSRF-Token': @identity.token }
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
                .when dataStore.getIdentity()
                .done (identity) =>
                    navigationBar.present identity: identity
                    @identity = identity
                    if identity.role == 'guest'
                        @$main.html renderTemplate 'login-view'
                        @initLoginForm()
                    else
                        @$main.html renderTemplate 'already-authenticated-view'
                .fail (err) =>
                    navigationBar.present()
                    @$main.html renderTemplate 'internal-error-view'

        dismiss: ->
            @$main.empty()
            @$main = null
            @identity = null
            navigationBar.dismiss()

    new LoginView()
