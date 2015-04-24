define 'notFoundView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'metadataStore', 'identityProvider'], ($, View, renderTemplate, dataStore, navigationBar, metadataStore, identityProvider) ->
    class NotFoundView extends View
        constructor: ->
            @$main = null
            super null

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: Not Found"

        present: ->
            @$main = $ '#main'

            $
                .when identityProvider.fetchIdentity()
                .done (identity) =>
                    identityProvider.subscribe()
                    navigationBar.present()
                    @$main.html renderTemplate 'not-found-view', urlPath: window.location.pathname
                .fail (err) =>
                    navigationBar.present()
                    @$main.html renderTemplate 'internal-error-view'

        dismiss: ->
            identityProvider.unsubscribe()
            @$main.empty()
            @$main = null
            navigationBar.dismiss()

    new NotFoundView()
