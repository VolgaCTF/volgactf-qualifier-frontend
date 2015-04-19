define 'indexView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'statusBar', 'metadataStore'], ($, View, renderTemplate, dataStore, navigationBar, statusBar, metadataStore) ->
    class IndexView extends View
        constructor: ->
            @$main = null
            @urlRegex = /^\/$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: Main"

        present: ->
            @$main = $ '#main'

            $
                .when dataStore.getIdentity(), dataStore.getContest()
                .done (identity, contest) =>
                    if dataStore.supportsRealtime()
                        dataStore.connectRealtime()

                    navigationBar.present
                        identity: identity

                    statusBar.present
                        identity: identity
                        contest: contest

                    @$main.html renderTemplate 'index-view', identity: identity, contest: contest
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

    new IndexView()
