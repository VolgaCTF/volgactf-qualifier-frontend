define 'contestProvider', ['jquery', 'underscore', 'EventEmitter', 'dataStore', 'metadataStore', 'contestModel', 'teamScoreModel'], ($, _, EventEmitter, dataStore, metadataStore, ContestModel, TeamScoreModel) ->
    class ContestProvider extends EventEmitter
        constructor: ->
            super()
            @contest = null
            @teamScores = []

            @onUpdate = null

        getContest: ->
            @contest

        getTeamScores: ->
            @teamScores

        subscribe: ->
            return unless dataStore.supportsRealtime()
            realtimeProvider = dataStore.getRealtimeProvider()

            @onUpdate = (e) =>
                data = JSON.parse e.data
                @contest = new ContestModel data
                @trigger 'updateContest', [@contest]

            realtimeProvider.addEventListener 'updateContest', @onUpdate

        unsubscribe: ->
            return unless dataStore.supportsRealtime()
            realtimeProvider = dataStore.getRealtimeProvider()

            if @onUpdate?
                realtimeProvider.removeEventListener 'updateContest', @onUpdate
                @onUpdate = null

            @contest = null
            @teamScores = []

        fetchContest: ->
            promise = $.Deferred()
            url = "#{metadataStore.getMetadata 'domain-api' }/contest"
            $.ajax
                url: url
                dataType: 'json'
                xhrFields:
                    withCredentials: yes
                success: (responseJSON, textStatus, jqXHR) =>
                    @contest = new ContestModel responseJSON
                    promise.resolve @contest
                error: (jqXHR, textStatus, errorThrown) ->
                    if jqXHR.responseJSON?
                        promise.reject jqXHR.responseJSON
                    else
                        promise.reject 'Unknown error. Please try again later.'

            promise

        fetchTeamScores: ->
            promise = $.Deferred()

            url = "#{metadataStore.getMetadata 'domain-api' }/contest/scores"
            $.ajax
                url: url
                dataType: 'json'
                xhrFields:
                    withCredentials: yes
                success: (responseJSON, textStatus, jqXHR) =>
                    @teamScores = _.map responseJSON, (options) ->
                        new TeamScoreModel options
                    promise.resolve @teamScores
                error: (jqXHR, textStatus, errorThrown) ->
                    if jqXHR.responseJSON?
                        promise.reject jqXHR.responseJSON
                    else
                        promise.reject 'Unknown error. Please try again later.'

            promise

    new ContestProvider()
