define 'scoreboardView', ['jquery', 'underscore', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'statusBar', 'metadataStore', 'moment', 'contestProvider', 'identityProvider', 'teamProvider'], ($, _, View, renderTemplate, dataStore, navigationBar, statusBar, metadataStore, moment, contestProvider, identityProvider, teamProvider) ->
    class ScoreboardView extends View
        constructor: ->
            @$main = null
            @urlRegex = /^\/scoreboard$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: Scoreboard"

        present: ->
            @$main = $ '#main'
            @$main.html renderTemplate 'scoreboard-view'

            $
                .when identityProvider.fetchIdentity(), contestProvider.fetchContest(), teamProvider.fetchTeams(), contestProvider.fetchTeamScores()
                .done (identity, contest, teams, teamScores) ->
                    identityProvider.subscribe()
                    if dataStore.supportsRealtime()
                        dataStore.connectRealtime()

                    navigationBar.present active: 'scoreboard'
                    statusBar.present()

                    rankFunc = (a, b) ->
                        if a.score > b.score
                            return -1
                        else if a.score < b.score
                            return 1
                        else
                            if a.updatedAt? and b.updatedAt?
                                if a.updatedAt.getTime() < b.updatedAt.getTime()
                                    return -1
                                else if a.updatedAt.getTime() > b.updatedAt.getTime()
                                    return 1
                                else
                                    return 0
                            else if a.updatedAt? and not b.updatedAt?
                                return -1
                            else if not a.updatedAt? and b.updatedAt?
                                return 1
                            else
                                return 0


                    $tableBody = $ '#themis-scoreboard-table-body'
                    $tableBody.empty()
                    teamScores.sort rankFunc
                    _.each teamScores, (teamScore, ndx) ->
                        team = _.findWhere teams, id: teamScore.teamId
                        if team?
                            obj =
                                rank: ndx + 1
                                id: team.id
                                name: team.name
                                score: teamScore.score
                                updatedAt: if teamScore.updatedAt? then moment(teamScore.updatedAt).format('lll') else 'never'
                            $tableBody.append $ renderTemplate 'scoreboard-table-row-partial', obj
                .fail =>
                    navigationBar.present()
                    @$main.html renderTemplate 'internal-error-view'

        dismiss: ->
            identityProvider.unsubscribe()
            @$main.empty()
            @$main = null
            navigationBar.dismiss()
            statusBar.dismiss()

            if dataStore.supportsRealtime()
                dataStore.disconnectRealtime()


    new ScoreboardView()
