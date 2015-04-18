define 'tasksView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'statusBar', 'metadataStore'], ($, View, renderTemplate, dataStore, navigationBar, statusBar, metadataStore) ->
    class TasksView extends View
        constructor: ->
            @$main = null
            @urlRegex = /^\/tasks$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: Tasks"

        present: ->
            @$main = $ '#main'
            @$main.html renderTemplate 'tasks-view'

            $
                .when dataStore.getIdentity(), dataStore.getContest()
                .done (identity, contest) ->
                    if dataStore.supportsRealtime()
                        dataStore.connectRealtime()

                    navigationBar.present
                        identity: identity
                        active: 'tasks'

                    statusBar.present
                        identity: identity
                        contest: contest
                .fail (err) =>
                    navigationBar.present()
                    @$main.html renderTemplate 'internal-error-view'

        dismiss: ->
            @$main.empty()
            @$main = null
            navigationBar.dismiss()
            statusBar.dismiss()

            if dataStore.supportsRealtime()
                dataStore.disconnectRealtime()


    new TasksView()
