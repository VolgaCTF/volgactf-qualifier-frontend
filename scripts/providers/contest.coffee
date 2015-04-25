define 'contestProvider', ['jquery', 'underscore', 'EventEmitter', 'dataStore', 'metadataStore', 'contestModel', 'teamScoreModel', 'teamProvider'], ($, _, EventEmitter, dataStore, metadataStore, ContestModel, TeamScoreModel, teamProvider) ->
    class ContestProvider extends EventEmitter
        constructor: ->
            super()
            @contest = null
            @teamScores = []

            @onUpdate = null
            @onUpdateTeamScore = null
            @onQualifyTeam = null

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

            @onUpdateTeamScore = (e) =>
                options = JSON.parse e.data
                teamScore = new TeamScoreModel options
                ndx = _.findIndex @teamScores, teamId: options.teamId
                if ndx > -1
                    @teamScores.splice ndx, 1
                @teamScores.push teamScore
                @trigger 'updateTeamScore', [teamScore]

            realtimeProvider.addEventListener 'updateTeamScore', @onUpdateTeamScore

            @onQualifyTeam = (team) =>
                ndx = _.findIndex @teamScores, teamId: team.id
                if ndx == -1
                    teamScore = new TeamScoreModel
                        teamId: team.id
                        score: 0
                        updatedAt: null
                    @teamScores.push teamScore
                    @trigger 'updateTeamScore', [teamScore]

            teamProvider.on 'qualifyTeam', @onQualifyTeam

        unsubscribe: ->
            return unless dataStore.supportsRealtime()
            realtimeProvider = dataStore.getRealtimeProvider()

            if @onUpdate?
                realtimeProvider.removeEventListener 'updateContest', @onUpdate
                @onUpdate = null

            if @onUpdateTeamScore?
                realtimeProvider.removeEventListener 'updateTeamScore', @onUpdateTeamScore
                @onUpdateTeamScore = null

            if @onQualifyTeam?
                teamProvider.off 'qualifyTeam', @onQualifyTeam
                @onQualifyTeam = null

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
