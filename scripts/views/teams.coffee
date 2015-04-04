define 'teamsView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'metadataStore'], ($, View, renderTemplate, dataStore, navigationBar, metadataStore) ->
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
                    $main.html renderTemplate 'internal-error'
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
                            $content = $('<ul></ul>').addClass 'themis-teams'
                            for team in teams
                                $content.append $('<li></li>').html renderTemplate 'team-profile-simplified-partial', identity: identity, team: team
                            $section.html $content

        dismiss: ->
            $('#main').empty()
            navigationBar.dismiss()

    new TeamsView()
