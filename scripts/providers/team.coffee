define 'teamProvider', ['jquery', 'underscore', 'EventEmitter', 'teamModel', 'metadataStore', 'identityProvider', 'dataStore'], ($, _, EventEmitter, TeamModel, metadataStore, identityProvider, dataStore) ->
    class TeamProvider extends EventEmitter
        constructor: ->
            super()
            @teams = []

            @onUpdateProfile = null
            @onCreate = null
            @onChangeEmail = null
            @onQualify = null

        getTeams: ->
            @teams

        subscribe: ->
            return unless dataStore.supportsRealtime()
            realtimeProvider = dataStore.getRealtimeProvider()

            identity = identityProvider.getIdentity()

            @onUpdateProfile = (e) =>
                options = JSON.parse e.data
                team = new TeamModel options
                ndx = _.findIndex @teams, id: options.id
                if ndx > -1
                    @teams.splice ndx, 1
                    # this indent is made for reason
                    @teams.push team
                    @trigger 'updateTeamProfile', [team]

            realtimeProvider.addEventListener 'updateTeamProfile', @onUpdateProfile

            @onQualify = (e) =>
                options = JSON.parse e.data
                team = new TeamModel options
                ndx = _.findIndex @teams, id: options.id
                if ndx > -1
                    @teams.splice ndx, 1
                @teams.push team
                @trigger 'qualifyTeam', [team]

            realtimeProvider.addEventListener 'qualifyTeam', @onQualify

            if _.contains ['admin', 'manager'], identity.role
                @onCreate = (e) =>
                    options = JSON.parse e.data
                    team = new TeamModel options
                    @teams.push team
                    @trigger 'createTeam', [team]

                realtimeProvider.addEventListener 'createTeam', @onCreate

                @onChangeEmail = (e) =>
                    options = JSON.parse e.data
                    team = new TeamModel options
                    ndx = _.findIndex @teams, id: options.id
                    if ndx > -1
                        @teams.splice ndx, 1
                    @teams.push team
                    @trigger 'changeTeamEmail', [team]

                realtimeProvider.addEventListener 'changeTeamEmail', @onChangeEmail

        unsubscribe: ->
            return unless dataStore.supportsRealtime()
            realtimeProvider = dataStore.getRealtimeProvider()
            if @onUpdateProfile?
                realtimeProvider.removeEventListener 'updateTeamProfile', @onUpdateProfile
                @onUpdateProfile = null

            if @onCreate?
                realtimeProvider.removeEventListener 'createTeam', @onCreate
                @onCreate = null

            if @onChangeEmail?
                realtimeProvider.removeEventListener 'changeTeamEmail', @onChangeEmail
                @onChangeEmail = null

            if @onQualify?
                realtimeProvider.removeEventListener 'qualifyTeam', @onQualify
                @onQualify = null

        fetchTeamProfile: (id) ->
            promise = $.Deferred()
            url = "#{metadataStore.getMetadata 'domain-api' }/team/#{id}/profile"
            $.ajax
                url: url
                dataType: 'json'
                xhrFields:
                    withCredentials: yes
                success: (responseJSON, textStatus, jqXHR) ->
                    promise.resolve new TeamModel responseJSON
                error: (jqXHR, textStatus, errorThrown) ->
                    if jqXHR.responseJSON?
                        promise.reject jqXHR.responseJSON
                    else
                        promise.reject 'Unknown error. Please try again later.'

            promise

        fetchTeams: (callback) ->
            promise = $.Deferred()
            url = "#{metadataStore.getMetadata 'domain-api' }/team/all"
            $.ajax
                url: url
                dataType: 'json'
                xhrFields:
                    withCredentials: yes
                success: (responseJSON, textStatus, jqXHR) =>
                    @teams = _.map responseJSON, (options) ->
                        new TeamModel options
                    promise.resolve @teams
                error: (jqXHR, textStatus, errorThrown) ->
                    if jqXHR.responseJSON?
                        promise.reject jqXHR.responseJSON
                    else
                        promise.reject 'Unknown error. Please try again later.'

            promise


    new TeamProvider()
