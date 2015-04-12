define 'scoreboardView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'metadataStore'], ($, View, renderTemplate, dataStore, navigationBar, metadataStore) ->
    class ScoreboardView extends View
        constructor: ->
            @urlRegex = /^\/scoreboard$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: Scoreboard"

        present: ->
            $main = $ '#main'
            $('#main').html renderTemplate 'scoreboard-view'

            dataStore.getIdentity (err, identity) ->
                if err?
                    $main.html renderTemplate 'internal-error-view'
                    navigationBar.present()
                else
                    navigationBar.present
                        identity: identity
                        active: 'scoreboard'

        dismiss: ->
            $('#main').empty()
            navigationBar.dismiss()

    new ScoreboardView()
