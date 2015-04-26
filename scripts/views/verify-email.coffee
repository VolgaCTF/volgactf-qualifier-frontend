define 'verifyEmailView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'metadataStore', 'identityProvider', 'jquery.history'], ($, View, renderTemplate, dataStore, navigationBar, metadataStore, identityProvider, History) ->
    class VerifyEmailView extends View
        constructor: ->
            @$main = null
            @urlRegex = /^\/verify-email$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: Email verification"

        present: ->
            @$main = $ '#main'

            $
                .when identityProvider.fetchIdentity()
                .done (identity) =>
                    identityProvider.subscribe()
                    navigationBar.present()

                    @$main.html renderTemplate 'verify-email-view', identity: identity

                    $progress = @$main.find 'p[data-role="progress"]'
                    $result = @$main.find 'p[data-role="result"]'

                    dataStore.verifyEmail History.getState().data.params, identity.token, (err, result) ->
                        $progress.hide()
                        if err?
                            $result.addClass('text-danger').text err
                        else
                            $result.addClass('text-success').text 'Email verified! Thank you!'
                .fail (err) =>
                    navigationBar.present()
                    @$main.html renderTemplate 'internal-error-view'

        dismiss: ->
            identityProvider.unsubscribe()
            @$main.empty()
            @$main = null
            navigationBar.dismiss()

    new VerifyEmailView()
