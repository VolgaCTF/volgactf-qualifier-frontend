define 'notFoundView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'metadataStore'], ($, View, renderTemplate, dataStore, navigationBar, metadataStore) ->
    class NotFoundView extends View
        constructor: ->
            @$main = null
            super null

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: Not Found"

        present: ->
            @$main = $ '#main'

            $
                .when dataStore.getIdentity()
                .done (identity) =>
                    navigationBar.present
                        identity: identity
                    @$main.html renderTemplate 'not-found-view', urlPath: window.location.pathname
                .fail (err) =>
                    navigationBar.present()
                    @$main.html renderTemplate 'internal-error-view'

        dismiss: ->
            @$main.empty()
            @$main = null
            navigationBar.dismiss()

    new NotFoundView()
