define 'verifyEmailView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'metadataStore', 'jquery.history'], ($, View, renderTemplate, dataStore, navigationBar, metadataStore, History) ->
    class VerifyEmailView extends View
        constructor: ->
            @urlRegex = /^\/verify-email$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: Email verification"

        present: ->
            dataStore.getIdentity (err, identity) ->
                $main = $ '#main'
                if err?
                    $main.html renderTemplate 'internal-error'
                    navigationBar.present()
                else
                    $main.html renderTemplate 'verify-email-view', identity: identity
                    navigationBar.present
                        identity: identity

                    $progress = $main.find 'p[data-role="progress"]'
                    $result = $main.find 'p[data-role="result"]'

                    dataStore.verifyEmail History.getState().data.params, (err, result) ->
                        $progress.hide()
                        if err?
                            $result.addClass('text-danger').text err
                        else
                            $result.addClass('text-success').text 'Email verified! Thank you!'

        dismiss: ->
            $('#main').empty()
            navigationBar.dismiss()

    new VerifyEmailView()
