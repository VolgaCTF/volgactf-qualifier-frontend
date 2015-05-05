define 'logProvider', ['jquery', 'underscore', 'dataStore', 'EventEmitter', 'metadataStore', 'logModel'], ($, _, dataStore, EventEmitter, metadataStore, LogModel) ->
    class LogProvider extends EventEmitter
        constructor: ->
            super()
            @logs = []

            @onCreate = null

        getLogs: ->
            @logs

        subscribe: ->
            return unless dataStore.supportsRealtime()
            realtimeProvider = dataStore.getRealtimeProvider()

            @onCreate = (e) =>
                options = JSON.parse e.data
                log = new LogModel options
                @logs.push log
                @trigger 'createLog', [log]

            realtimeProvider.addEventListener 'createLog', @onCreate

        unsubscribe: ->
            return unless dataStore.supportsRealtime()
            realtimeProvider = dataStore.getRealtimeProvider()

            if @onCreate
                realtimeProvider.removeEventListener 'createLog', @onCreate
                @onCreate = null

            @logs = []

        fetchLogs: ->
            promise = $.Deferred()
            url = "#{metadataStore.getMetadata 'domain-api' }/contest/logs"
            $.ajax
                url: url
                dataType: 'json'
                xhrFields:
                    withCredentials: yes
                success: (responseJSON, textStatus, jqXHR) =>
                    @logs = _.map responseJSON, (options) ->
                        new LogModel options
                    promise.resolve @logs
                error: (jqXHR, textStatus, errorThrown) ->
                    if jqXHR.responseJSON?
                        promise.reject jqXHR.responseJSON
                    else
                        promise.reject 'Unknown error. Please try again later.'

            promise


    new LogProvider()
