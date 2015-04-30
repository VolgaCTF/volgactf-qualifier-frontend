define 'indexView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'statusBar', 'metadataStore', 'contestProvider', 'identityProvider'], ($, View, renderTemplate, dataStore, navigationBar, statusBar, metadataStore, contestProvider, identityProvider) ->
    class IndexView extends View
        constructor: ->
            @$main = null
            @urlRegex = /^\/$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: Main"

        present: ->
            @$main = $ '#main'

            $
                .when identityProvider.fetchIdentity()
                .done (identity) =>
                    if identity.role is 'team'
                        promise = $.when contestProvider.fetchContest(), contestProvider.fetchTeamScores()
                    else
                        promise = $.when contestProvider.fetchContest()

                    promise
                        .done (contest) =>
                            identityProvider.subscribe()
                            if dataStore.supportsRealtime()
                                dataStore.connectRealtime()

                            navigationBar.present()
                            statusBar.present()

                            @$main.html renderTemplate 'index-view', identity: identity, contest: contest
                        .fail (err) =>
                            navigationBar.present()
                            @$main.html renderTemplate 'internal-error-view'
                .fail (err) =>
                    navigationBar.present()
                    @$main.html renderTemplate 'internal-error-view'

        dismiss: ->
            identityProvider.unsubscribe()
            @$main.empty()
            @$main = null
            navigationBar.dismiss()
            statusBar.dismiss()

            if dataStore.supportsRealtime()
                dataStore.disconnectRealtime()

    new IndexView()
