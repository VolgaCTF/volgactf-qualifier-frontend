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
                .when identityProvider.fetchIdentity(), contestProvider.fetchContest()
                .done (identity, contest) =>
                    identityProvider.subscribe()
                    if dataStore.supportsRealtime()
                        dataStore.connectRealtime()

                    navigationBar.present()
                    statusBar.present()

                    @$main.html renderTemplate 'index-view', identity: identity, contest: contest
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
