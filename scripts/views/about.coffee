define 'aboutView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'statusBar', 'metadataStore', 'contestProvider'], ($, View, renderTemplate, dataStore, navigationBar, statusBar, metadataStore, contestProvider) ->
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
                .when dataStore.getIdentity(), contestProvider.fetchContest()
                .done (identity, contest) ->
                    if dataStore.supportsRealtime()
                        dataStore.connectRealtime()

                    navigationBar.present
                        identity: identity
                        active: 'about'

                    statusBar.present
                        identity: identity
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
