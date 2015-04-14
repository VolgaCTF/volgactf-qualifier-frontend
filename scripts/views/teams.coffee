define 'teamsView', ['jquery', 'underscore', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'metadataStore'], ($, _, View, renderTemplate, dataStore, navigationBar, metadataStore) ->
    class TeamsView extends View
        constructor: ->
            @urlRegex = /^\/teams$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: Teams"

        present: ->
            $main = $ '#main'
            $('#main').html renderTemplate 'teams-view'

            dataStore.getIdentity (err, identity) ->
                if err?
                    $main.html renderTemplate 'internal-error-view'
                    navigationBar.present()
                else
                    navigationBar.present
                        identity: identity
                        active: 'teams'

                    $section = $main.find 'section'

                    dataStore.getTeams (err, teams) ->
                        if err?
                            $section.html $('<p></p>').addClass('lead text-danger').text err
                        else
                            sortedTeams = _.sortBy teams, 'createdAt'
                            $main.find('.themis-team-count').show().html renderTemplate 'team-count-partial', count: teams.length

                            $content = $('<ul></ul>').addClass 'themis-teams list-unstyled'
                            for team in sortedTeams
                                $content.append $('<li></li>').html renderTemplate 'team-profile-simplified-partial', identity: identity, team: team
                            $section.html $content

        dismiss: ->
            $('#main').empty()
            navigationBar.dismiss()

    new TeamsView()
