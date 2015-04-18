define 'scoreboardView', ['jquery', 'underscore', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'statusBar', 'metadataStore', 'moment'], ($, _, View, renderTemplate, dataStore, navigationBar, statusBar, metadataStore, moment) ->
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
                .when dataStore.getIdentity(), dataStore.getContest(), dataStore.getTeams(), dataStore.getTeamScores()
                .done (identity, contest, teams, teamScores) ->
                    if dataStore.supportsRealtime()
                        dataStore.connectRealtime()

                    navigationBar.present
                        identity: identity
                        active: 'scoreboard'

                    statusBar.present
                        identity: identity
                        contest: contest

                    $tableBody = $ '#themis-scoreboard-table-body'
                    $tableBody.empty()
                    sortedScores = teamScores
                    _.each sortedScores, (teamScore, ndx) ->
                        team = _.findWhere teams, id: teamScore.team
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
            @$main.empty()
            @$main = null
            navigationBar.dismiss()
            statusBar.dismiss()

            if dataStore.supportsRealtime()
                dataStore.disconnectRealtime()


    new ScoreboardView()
