define 'controlView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'metadataStore'], ($, View, renderTemplate, dataStore, navigationBar, metadataStore) ->
    class ControlView extends View
        constructor: ->
            @urlRegex = /^\/control$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: Control"

        present: ->
            $main = $ '#main'

            $
                .when dataStore.getIdentity()
                .done (identity) ->
                    navigationBar.present
                        identity: identity
                        active: 'control'

                    if identity.role == 'admin'
                        $main.html renderTemplate 'control-view'
                    else
                        $main.html renderTemplate 'access-forbidden-view', urlPath: window.location.pathname
                .fail (err) ->
                    navigationBar.present()
                    $main.html renderTemplate 'internal-error-view'

        dismiss: ->
            $('#main').empty()
            navigationBar.dismiss()

    new ControlView()
