define 'indexView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'statusBar', 'metadataStore', 'contestProvider', 'identityProvider'], ($, View, renderTemplate, dataStore, navigationBar, statusBar, metadataStore, contestProvider, identityProvider) ->
    class IndexView extends View
        constructor: ->
            @$main = null

            @onUpdateContest = null

            @urlRegex = /^\/$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: Main"

        render: ->
            identity = identityProvider.getIdentity()
            contest = contestProvider.getContest()
            @$main.empty()
            @$main.html renderTemplate 'index-view', identity: identity, contest: contest

        present: ->
            @$main = $ '#main'
            @$main.html renderTemplate 'loading-view'

            $
                .when identityProvider.fetchIdentity()
                .done (identity) =>
                    if identity.role is 'team'
                        promise = $.when contestProvider.fetchContest(), contestProvider.fetchTeamScores()
                    else
                        promise = $.when contestProvider.fetchContest()

                    promise
                        .done =>
                            identityProvider.subscribe()
                            if dataStore.supportsRealtime()
                                dataStore.connectRealtime()

                            navigationBar.present()
                            statusBar.present()

                            @render()

                            @onUpdateContest = (e) =>
                                @render()
                                false

                            contestProvider.on 'updateContest', @onUpdateContest
                        .fail (err) =>
                            navigationBar.present()
                            @$main.html renderTemplate 'internal-error-view'
                .fail (err) =>
                    navigationBar.present()
                    @$main.html renderTemplate 'internal-error-view'

        dismiss: ->
            identityProvider.unsubscribe()

            if @onUpdateContest?
                contestProvider.off 'updateContest', @onUpdateContest
                @onUpdateContest = null

            @$main.empty()
            @$main = null
            navigationBar.dismiss()
            statusBar.dismiss()

            if dataStore.supportsRealtime()
                dataStore.disconnectRealtime()

    new IndexView()
