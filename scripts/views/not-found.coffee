define 'notFoundView', ['jquery', 'view', 'renderTemplate', 'navigationBar', 'metadataStore'], ($, View, renderTemplate, navigationBar, metadataStore) ->
    class NotFoundView extends View
        constructor: ->
            super null

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: Not Found"

        present: ->
            $('#main').html renderTemplate 'not-found-view', urlPath: window.location.pathname

        dismiss: ->
            $('#main').empty()

    new NotFoundView()
