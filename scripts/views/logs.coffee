define 'logsView', ['jquery', 'underscore', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'statusBar', 'metadataStore'], ($, _, View, renderTemplate, dataStore, navigationBar, statusBar, metadataStore) ->
    class LogsView extends View
        constructor: ->
            @$main = null
            @urlRegex = /^\/logs$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: Logs"

        present: ->
            @$main = $ '#main'

            $
                .when dataStore.getIdentity(), dataStore.getContest()
                .done (identity, contest) =>
                    if dataStore.supportsRealtime()
                        dataStore.connectRealtime()

                    navigationBar.present
                        identity: identity
                        active: 'logs'

                    statusBar.present
                        identity: identity
                        contest: contest

                    if _.contains ['admin', 'manager'], identity.role
                        @$main.html renderTemplate 'logs-view'
                    else
                        @$main.html renderTemplate 'access-forbidden-view', urlPath: window.location.pathname
                .fail (err) =>
                    navigationBar.present()
                    @$main.html renderTemplate 'internal-error-view'

        dismiss: ->
            @$main.empty()
            @$main = null
            navigationBar.dismiss()
            statusBar.dismiss()

            if dataStore.supportsRealtime()
                dataStore.disconnectRealtime()


    new LogsView()
