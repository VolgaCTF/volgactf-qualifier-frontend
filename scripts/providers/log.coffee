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


    new LogProvider()
