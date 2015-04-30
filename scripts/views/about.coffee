define 'aboutView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'statusBar', 'metadataStore', 'contestProvider', 'identityProvider'], ($, View, renderTemplate, dataStore, navigationBar, statusBar, metadataStore, contestProvider, identityProvider) ->
    class AboutView extends View
        constructor: ->
            @$main = null
            @urlRegex = /^\/about$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: About"

        present: ->
            @$main = $ '#main'
            @$main.html renderTemplate 'loading-view'

            $
                .when identityProvider.fetchIdentity()
                .done (identity) =>
                    if identity.role is 'team'
                        promise = $.when contestProvider.fetchContest(), contestProvider.fetchTeamScores()
                    else
                        promise = $.when contestProvider.fetchContest()

                    promise
                        .done (contest) =>
                            @$main.html renderTemplate 'about-view', identity: identity
                            identityProvider.subscribe()

                            if dataStore.supportsRealtime()
                                dataStore.connectRealtime()

                            navigationBar.present active: 'about'
                            statusBar.present()
                        .fail (err) ->
                            navigationBar.present()
                            $main.html renderTemplate 'internal-error-view'
                .fail (err) ->
                    navigationBar.present()
                    $main.html renderTemplate 'internal-error-view'

        dismiss: ->
            identityProvider.unsubscribe()

            @$main.empty()
            navigationBar.dismiss()
            statusBar.dismiss()

            if dataStore.supportsRealtime()
                dataStore.disconnectRealtime()


    new AboutView()
