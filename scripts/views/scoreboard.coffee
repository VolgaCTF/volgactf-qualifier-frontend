define 'scoreboardView', ['jquery', 'underscore', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'statusBar', 'metadataStore', 'moment', 'contestProvider', 'identityProvider', 'teamProvider'], ($, _, View, renderTemplate, dataStore, navigationBar, statusBar, metadataStore, moment, contestProvider, identityProvider, teamProvider) ->
    class ScoreboardView extends View
        constructor: ->
            @$main = null

            @onUpdateTeamScore = null

            @urlRegex = /^\/scoreboard$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: Scoreboard"

        renderScoreboard: ->
            $tableBody = $ '#themis-scoreboard-table-body'
            $tableBody.empty()

            teamScores = contestProvider.getTeamScores()
            teams = teamProvider.getTeams()

            identity = identityProvider.getIdentity()
            isTeam = identity.role is 'team'

            teamScores.sort contestProvider.teamRankFunc
            _.each teamScores, (teamScore, ndx) ->
                team = _.findWhere teams, id: teamScore.teamId
                if team?
                    obj =
                        rank: ndx + 1
                        id: team.id
                        name: team.name
                        score: teamScore.score
                        updatedAt: if teamScore.updatedAt? then moment(teamScore.updatedAt).format('lll') else 'never'
                        highlight: isTeam and team.id == identity.id
                    $tableBody.append $ renderTemplate 'scoreboard-table-row-partial', obj

        present: ->
            @$main = $ '#main'

            $
                .when identityProvider.fetchIdentity()
                .done (identity) =>
                    identityProvider.subscribe()
                    @$main.html renderTemplate 'scoreboard-view', identity: identity
                    $
                        .when contestProvider.fetchContest(), teamProvider.fetchTeams(), contestProvider.fetchTeamScores()
                        .done (contest, teams, teamScores) =>
                            if dataStore.supportsRealtime()
                                dataStore.connectRealtime()

                            teamProvider.subscribe()

                            navigationBar.present active: 'scoreboard'
                            statusBar.present()

                            @renderScoreboard()

                            @onUpdateTeamScore = (teamScore) =>
                                @renderScoreboard()
                                false
                            contestProvider.on 'updateTeamScore', @onUpdateTeamScore
                        .fail =>
                            navigationBar.present()
                            @$main.html renderTemplate 'internal-error-view'

                .fail =>
                    navigationBar.present()
                    @$main.html renderTemplate 'internal-error-view'

        dismiss: ->
            identityProvider.unsubscribe()
            teamProvider.unsubscribe()

            if @onUpdateTeamScore?
                contestProvider.off 'updateTeamScore', @onUpdateTeamScore
                @onUpdateTeamScore = null

            @$main.empty()
            @$main = null
            navigationBar.dismiss()
            statusBar.dismiss()

            if dataStore.supportsRealtime()
                dataStore.disconnectRealtime()


    new ScoreboardView()
