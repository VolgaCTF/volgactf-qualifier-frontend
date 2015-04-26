define 'signupView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'stateController', 'metadataStore', 'contestProvider', 'identityProvider', 'parsley', 'jquery.form', 'bootstrap-filestyle'], ($, View, renderTemplate, dataStore, navigationBar, stateController, metadataStore, contestProvider, identityProvider) ->
    class SignupView extends View
        constructor: ->
            @$main = null
            @urlRegex = /^\/signup$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: Sign up"

        initSignupForm: ->
            $form = @$main.find 'form.themis-form-signup'
            $form.parsley()

            $form.find('input[name="team"]').focus()

            $successAlert = @$main.find 'div.themis-alert-signup'

            $submitError = $form.find '.submit-error > p'
            $submitButton = $form.find 'button'

            $form.find('input:file').filestyle()
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
                .when identityProvider.fetchIdentity(), contestProvider.fetchContest()
                .done (identity, contest) =>
                    identityProvider.subscribe()
                    navigationBar.present()

                    if identity.role == 'guest'
                        if contest.isFinished()
                            @$main.html renderTemplate 'signup-not-available-view'
                        else
                            @$main.html renderTemplate 'signup-view'
                            @initSignupForm()
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

    new SignupView()
