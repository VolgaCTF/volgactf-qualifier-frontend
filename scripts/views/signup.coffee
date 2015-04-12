define 'signupView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'stateController', 'metadataStore', 'parsley', 'jquery.form', 'bootstrap-filestyle'], ($, View, renderTemplate, dataStore, navigationBar, stateController, metadataStore) ->
    class SignupView extends View
        constructor: ->
            @urlRegex = /^\/signup$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: Sign up"

        present: ->
            dataStore.getIdentity (err, identity) ->
                $main = $ '#main'
                if err?
                    $main.html renderTemplate 'internal-error'
                    navigationBar.present()
                    return

                if identity.role == 'guest'
                    $main.html renderTemplate 'signup-view'

                    $form = $main.find 'form.themis-form-signup'
                    $form.parsley()

                    $form.find('input[name="team"]').focus()

                    $successAlert = $main.find 'div.themis-alert-signup'

                    $submitError = $form.find '.submit-error > p'
                    $submitButton = $form.find 'button'

                    $form.find('input:file').filestyle()
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
                    $main.html renderTemplate 'already-authenticated'

                navigationBar.present identity: identity

        dismiss: ->
            $('#main').empty()
            navigationBar.dismiss()

    new SignupView()
