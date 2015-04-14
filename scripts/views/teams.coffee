define 'teamsView', ['jquery', 'underscore', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'metadataStore'], ($, _, View, renderTemplate, dataStore, navigationBar, metadataStore) ->
    class TeamsView extends View
        constructor: ->
            @$main = null
            @urlRegex = /^\/teams$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: Teams"

        present: ->
            @$main = $ '#main'

            $
                .when dataStore.getIdentity()
                .done (identity) =>
                    navigationBar.present
                        identity: identity
                        active: 'teams'

                    @$main.html renderTemplate 'teams-view'
                    $section = @$main.find 'section'

                    dataStore.getTeams (err, teams) =>
                        if err?
                            $section.html $('<p></p>').addClass('lead text-danger').text err
                        else
                            sortedTeams = _.sortBy teams, 'createdAt'
                            @$main.find('.themis-team-count').show().html renderTemplate 'team-count-partial', count: teams.length

                            $content = $('<ul></ul>').addClass 'themis-teams list-unstyled'
                            for team in sortedTeams
                                $content.append $('<li></li>').html renderTemplate 'team-profile-simplified-partial', identity: identity, team: team
                            $section.html $content

                .fail (err) =>
                    navigationBar.present()
                    @$main.html renderTemplate 'internal-error-view'

        dismiss: ->
            @$main.empty()
            @$main = null
            navigationBar.dismiss()

    new TeamsView()
