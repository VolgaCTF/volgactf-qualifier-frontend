define 'aboutView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'statusBar', 'metadataStore'], ($, View, renderTemplate, dataStore, navigationBar, statusBar, metadataStore) ->
    class AboutView extends View
        constructor: ->
            @$main = null
            @urlRegex = /^\/about$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: About"

        present: ->
            @$main = $ '#main'
            @$main.html renderTemplate 'about-view'

            $
                .when dataStore.getIdentity(), dataStore.getContest()
                .done (identity, contest) ->
                    if dataStore.supportsRealtime()
                        dataStore.connectRealtime()

                    navigationBar.present
                        identity: identity
                        active: 'about'

                    statusBar.present
                        identity: identity
                        contest: contest
                .fail (err) ->
                    navigationBar.present()
                    $main.html renderTemplate 'internal-error-view'

        dismiss: ->
            @$main.empty()
            navigationBar.dismiss()
            statusBar.dismiss()

            if dataStore.supportsRealtime()
                dataStore.disconnectRealtime()


    new AboutView()
