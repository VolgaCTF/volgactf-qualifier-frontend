define 'notFoundView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'metadataStore'], ($, View, renderTemplate, dataStore, navigationBar, metadataStore) ->
    class NotFoundView extends View
        constructor: ->
            super null

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: Not Found"

        present: ->
            $main = $ '#main'
            $main.html renderTemplate 'not-found-view', urlPath: window.location.pathname

            dataStore.getIdentity (err, identity) ->
                if err?
                    $main.html renderTemplate 'internal-error'
                    navigationBar.present()
                else
                    navigationBar.present
                        identity: identity

        dismiss: ->
            $('#main').empty()
            navigationBar.dismiss()

    new NotFoundView()
