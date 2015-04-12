define 'signinView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'stateController', 'metadataStore', 'parsley', 'jquery.form'], ($, View, renderTemplate, dataStore, navigationBar, stateController, metadataStore) ->
    class SigninView extends View
        constructor: ->
            @urlRegex = /^\/signin$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: Sign in"

        present: ->
            dataStore.getIdentity (err, identity) ->
                $main = $ '#main'
                if err?
                    $main.html renderTemplate 'internal-error-view'
                    navigationBar.present()
                    return

                if identity.role == 'guest'
                    $main.html renderTemplate 'signin-view'
                    navigationBar.present active: 'signin'

                    $form = $main.find 'form.themis-form-signin'
                    $form.parsley()

                    $form.find('input[name="team"]').focus()

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

    new SigninView()
