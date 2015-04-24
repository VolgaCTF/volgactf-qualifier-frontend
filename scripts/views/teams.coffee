define 'teamsView', ['jquery', 'underscore', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'statusBar', 'metadataStore', 'teamModel', 'contestProvider', 'identityProvider', 'teamProvider'], ($, _, View, renderTemplate, dataStore, navigationBar, statusBar, metadataStore, TeamModel, contestProvider, identityProvider, teamProvider) ->
    class TeamsView extends View
        constructor: ->
            @$main = null

            @onUpdateTeamProfile = null
            @onCreateTeam = null
            @onChangeTeamEmail = null
            @onQualifyTeam = null

            @urlRegex = /^\/teams$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: Teams"

        renderTeams: ->
            sortedTeams = _.sortBy teamProvider.getTeams(), 'createdAt'
            @$main.find('.themis-team-count').show().html renderTemplate 'team-count-partial', count: sortedTeams.length

            $section = @$main.find 'section'
            $section.empty()

            $content = $('<ul></ul>').addClass 'themis-teams list-unstyled'
            identity = identityProvider.getIdentity()
            for team in sortedTeams
                $content.append $('<li></li>').html renderTemplate 'team-profile-simplified-partial', identity: identity, team: team
            $section.html $content

        present: ->
            @$main = $ '#main'

            $
                .when identityProvider.fetchIdentity(), contestProvider.fetchContest()
                .done (identity, contest) =>
                    identityProvider.subscribe()
                    if dataStore.supportsRealtime()
                        dataStore.connectRealtime()

                    navigationBar.present active: 'teams'
                    statusBar.present()

                    @$main.html renderTemplate 'teams-view'
                    $section = @$main.find 'section'

                    $
                        .when teamProvider.fetchTeams()
                        .fail (err) ->
                            $section.html $('<p></p>').addClass('lead text-danger').text err
                        .done (teams) =>
                            @renderTeams()

                            teamProvider.subscribe()

                            @onUpdateTeamProfile = (team) =>
                                @renderTeams()
                                false

                            teamProvider.on 'updateTeamProfile', @onUpdateTeamProfile

                            @onQualifyTeam = (team) =>
                                @renderTeams()
                                false

                            teamProvider.on 'qualifyTeam', @onQualifyTeam

                            if _.contains ['admin', 'manager'], identity.role
                                @onCreateTeam = (team) =>
                                    @renderTeams()
                                    false

                                teamProvider.on 'createTeam', @onCreateTeam

                                @onChangeTeamEmail = (team) =>
                                    @renderTeams()
                                    false

                                teamProvider.on 'changeTeamEmail', @onChangeTeamEmail
                .fail (err) =>
                    navigationBar.present()
                    @$main.html renderTemplate 'internal-error-view'

        dismiss: ->
            identityProvider.unsubscribe()

            if @onUpdateTeamProfile?
                teamProvider.off 'updateTeamProfile', @onUpdateTeamProfile
                @onUpdateTeamProfile = null
            if @onCreateTeam?
                teamProvider.off 'createTeam', @onCreateTeam
                @onCreateTeam = null
            if @onChangeTeamEmail?
                teamProvider.off 'changeTeamEmail', @onChangeTeamEmail
                @onChangeTeamEmail = null
            if @onQualifyTeam?
                teamProvider.off 'qualifyTeam', @onQualifyTeam
                @onQualifyTeam = null
            teamProvider.unsubscribe()

            @$main.empty()
            @$main = null
            navigationBar.dismiss()
            statusBar.dismiss()

            if dataStore.supportsRealtime()
                dataStore.disconnectRealtime()

    new TeamsView()
