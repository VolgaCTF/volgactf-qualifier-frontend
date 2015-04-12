define 'controlView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'metadataStore'], ($, View, renderTemplate, dataStore, navigationBar, metadataStore) ->
    class ControlView extends View
        constructor: ->
            @urlRegex = /^\/control$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: Control"

        present: ->
            $main = $ '#main'

            dataStore.getIdentity (err, identity) ->
                if err?
                    $main.html renderTemplate 'internal-error-view'
                    navigationBar.present()
                else
                    if identity.role == 'admin'
                        $main.html renderTemplate 'control-view'
                    else
                        $main.html renderTemplate 'access-forbidden-view', urlPath: window.location.pathname

                    navigationBar.present
                        identity: identity
                        active: 'control'

        dismiss: ->
            $('#main').empty()
            navigationBar.dismiss()

    new ControlView()
