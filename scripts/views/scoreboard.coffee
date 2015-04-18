define 'scoreboardView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'statusBar', 'metadataStore'], ($, View, renderTemplate, dataStore, navigationBar, statusBar, metadataStore) ->
    class ScoreboardView extends View
        constructor: ->
            @$main = null
            @urlRegex = /^\/scoreboard$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: Scoreboard"

        present: ->
            @$main = $ '#main'
            @$main.html renderTemplate 'scoreboard-view'

            $
                .when dataStore.getIdentity(), dataStore.getContest()
                .done (identity, contest) ->
                    if dataStore.supportsRealtime()
                        dataStore.connectRealtime()

                    navigationBar.present
                        identity: identity
                        active: 'scoreboard'

                    statusBar.present
                        identity: identity
                        contest: contest
                .fail =>
                    navigationBar.present()
                    @$main.html renderTemplate 'internal-error-view'

        dismiss: ->
            @$main.empty()
            @$main = null
            navigationBar.dismiss()
            statusBar.dismiss()

            if dataStore.supportsRealtime()
                dataStore.disconnectRealtime()


    new ScoreboardView()
