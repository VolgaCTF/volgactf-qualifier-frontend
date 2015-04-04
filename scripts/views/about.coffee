define 'aboutView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'metadataStore'], ($, View, renderTemplate, dataStore, navigationBar, metadataStore) ->
    class AboutView extends View
        constructor: ->
            @urlRegex = /^\/about$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: About"

        present: ->
            $main = $ '#main'
            $('#main').html renderTemplate 'about-view'

            dataStore.getIdentity (err, identity) ->
                if err?
                    $main.html renderTemplate 'internal-error'
                    navigationBar.present()
                else
                    navigationBar.present
                        identity: identity
                        active: 'about'

        dismiss: ->
            $('#main').empty()
            navigationBar.dismiss()

    new AboutView()
