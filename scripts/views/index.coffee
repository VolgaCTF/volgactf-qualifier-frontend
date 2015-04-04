define 'indexView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'metadataStore'], ($, View, renderTemplate, dataStore, navigationBar, metadataStore) ->
    class IndexView extends View
        constructor: ->
            @urlRegex = /^\/$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: Main"

        present: ->
            dataStore.getIdentity (err, identity) ->
                $main = $ '#main'
                if err?
                    $main.html renderTemplate 'internal-error'
                    navigationBar.present()
                else
                    $('#main').html renderTemplate 'index-view', identity: identity
                    navigationBar.present
                        identity: identity

        dismiss: ->
            $('#main').empty()
            navigationBar.dismiss()

    new IndexView()
