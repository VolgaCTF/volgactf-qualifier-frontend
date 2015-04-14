define 'indexView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'metadataStore'], ($, View, renderTemplate, dataStore, navigationBar, metadataStore) ->
    class IndexView extends View
        constructor: ->
            @$main = null
            @urlRegex = /^\/$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: Main"

        present: ->
            @$main = $ '#main'

            $
                .when dataStore.getIdentity()
                .done (identity) =>
                    navigationBar.present
                        identity: identity
                    @$main.html renderTemplate 'index-view', identity: identity
                .fail (err) =>
                    navigationBar.present()
                    @$main.html renderTemplate 'internal-error-view'

        dismiss: ->
            @$main.empty()
            @$main = null
            navigationBar.dismiss()

    new IndexView()
