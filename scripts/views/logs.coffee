define 'logsView', ['jquery', 'underscore', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'statusBar', 'metadataStore', 'contestProvider', 'identityProvider'], ($, _, View, renderTemplate, dataStore, navigationBar, statusBar, metadataStore, contestProvider, identityProvider) ->
    class LogsView extends View
        constructor: ->
            @$main = null
            @urlRegex = /^\/logs$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: Logs"

        present: ->
            @$main = $ '#main'

            $
                .when identityProvider.fetchIdentity(), contestProvider.fetchContest()
                .done (identity, contest) =>
                    identityProvider.subscribe()
                    if dataStore.supportsRealtime()
                        dataStore.connectRealtime()

                    navigationBar.present active: 'logs'
                    statusBar.present()

                    if _.contains ['admin', 'manager'], identity.role
                        @$main.html renderTemplate 'logs-view'
                    else
                        @$main.html renderTemplate 'access-forbidden-view', urlPath: window.location.pathname
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


    new LogsView()
