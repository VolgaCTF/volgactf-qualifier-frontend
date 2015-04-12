define 'logsView', ['jquery', 'underscore', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'metadataStore'], ($, _, View, renderTemplate, dataStore, navigationBar, metadataStore) ->
    class LogsView extends View
        constructor: ->
            @urlRegex = /^\/logs$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: Logs"

        present: ->
            $main = $ '#main'

            dataStore.getIdentity (err, identity) ->
                if err?
                    $main.html renderTemplate 'internal-error-view'
                    navigationBar.present()
                else
                    if _.contains ['admin', 'manager'], identity.role
                        $main.html renderTemplate 'logs-view'
                    else
                        $main.html renderTemplate 'access-forbidden-view', urlPath: window.location.pathname

                    navigationBar.present
                        identity: identity
                        active: 'logs'

        dismiss: ->
            $('#main').empty()
            navigationBar.dismiss()

    new LogsView()
