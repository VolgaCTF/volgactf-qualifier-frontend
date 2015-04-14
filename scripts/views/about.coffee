define 'aboutView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'metadataStore'], ($, View, renderTemplate, dataStore, navigationBar, metadataStore) ->
    class AboutView extends View
        constructor: ->
            @urlRegex = /^\/about$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: About"

        present: ->
            $main = $ '#main'
            $('#main').html renderTemplate 'about-view'

            $
                .when dataStore.getIdentity()
                .done (identity) ->
                    navigationBar.present
                        identity: identity
                        active: 'about'
                .fail (err) ->
                    navigationBar.present()
                    $main.html renderTemplate 'internal-error-view'

        dismiss: ->
            $('#main').empty()
            navigationBar.dismiss()

    new AboutView()
