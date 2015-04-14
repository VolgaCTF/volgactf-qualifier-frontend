define 'logsView', ['jquery', 'underscore', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'metadataStore'], ($, _, View, renderTemplate, dataStore, navigationBar, metadataStore) ->
    class LogsView extends View
        constructor: ->
            @$main = null
            @urlRegex = /^\/logs$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: Logs"

        present: ->
            @$main = $ '#main'

            $
                .when dataStore.getIdentity()
                .done (identity) =>
                    navigationBar.present
                        identity: identity
                        active: 'logs'

                    if _.contains ['admin', 'manager'], identity.role
                        @$main.html renderTemplate 'logs-view'
                    else
                        @$main.html renderTemplate 'access-forbidden-view', urlPath: window.location.pathname
                .fail (err) =>
                    navigationBar.present()
                    @$main.html renderTemplate 'internal-error-view'

        dismiss: ->
            @$main.empty()
            @$main = null
            navigationBar.dismiss()

    new LogsView()
