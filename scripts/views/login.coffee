define 'loginView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'stateController', 'metadataStore', 'parsley', 'jquery.form'], ($, View, renderTemplate, dataStore, navigationBar, stateController, metadataStore) ->
    class LoginView extends View
        constructor: ->
            @urlRegex = /^\/login$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: Login"

        present: ->
            dataStore.getIdentity (err, identity) ->
                $main = $ '#main'
                if err?
                    $main.html renderTemplate 'internal-error-view'
                    navigationBar.present()
                    return

                if identity.role == 'guest'
                    $main.html renderTemplate 'login-view'

                    $form = $main.find 'form.themis-form-login'
                    $form.parsley()

                    $submitError = $form.find '.submit-error > p'
                    $submitButton = $form.find 'button'

                    $form.on 'submit', (e) ->
                        e.preventDefault()
                        $form.ajaxSubmit
                            beforeSubmit: ->
                                $submitError.text ''
                                $submitButton.prop 'disabled', yes
                            clearForm: yes
                            dataType: 'json'
                            xhrFields:
                                withCredentials: yes
                            headers: { 'X-CSRF-Token': identity.token }
                            success: (responseText, textStatus, jqXHR) ->
                                stateController.navigateTo '/'
                            error: (jqXHR, textStatus, errorThrown) ->
                                if jqXHR.responseJSON?
                                    $submitError.text jqXHR.responseJSON
                                else
                                    $submitError.text 'Unknown error. Please try again later.'
                            complete: ->
                                $submitButton.prop 'disabled', no
                else
                    $main.html renderTemplate 'already-authenticated-view'

                navigationBar.present identity: identity

        dismiss: ->
            $('#main').empty()
            navigationBar.dismiss()

    new LoginView()
