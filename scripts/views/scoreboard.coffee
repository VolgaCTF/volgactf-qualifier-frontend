define 'scoreboardView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'metadataStore'], ($, View, renderTemplate, dataStore, navigationBar, metadataStore) ->
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
                .when dataStore.getIdentity()
                .done (identity) ->
                    navigationBar.present
                        identity: identity
                        active: 'scoreboard'
                .fail (err) =>
                    navigationBar.present()
                    @$main.html renderTemplate 'internal-error-view'

        dismiss: ->
            @$main.empty()
            @$main = null
            navigationBar.dismiss()

    new ScoreboardView()
