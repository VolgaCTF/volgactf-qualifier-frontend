define 'logsView', ['jquery', 'underscore', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'statusBar', 'metadataStore', 'contestProvider', 'identityProvider', 'teamProvider', 'taskProvider', 'logProvider', 'moment'], ($, _, View, renderTemplate, dataStore, navigationBar, statusBar, metadataStore, contestProvider, identityProvider, teamProvider, taskProvider, logProvider, moment) ->
    class LogsView extends View
        constructor: ->
            @$main = null

            @onCreateLog = null
            @$logsContainer = null

            @urlRegex = /^\/logs$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: Logs"

        prependLog: (log) ->
            teams = teamProvider.getTeams()
            tasks = taskProvider.getTaskPreviews()

            $el = null
            if log.event == 1
                team = _.findWhere teams, id: log.data.teamId
                task = _.findWhere tasks, id: log.data.taskId
                if team? and task?
                    $el = $ renderTemplate 'log-entry-1', team: team, task: task, answer: log.data.answer, createdAt: moment(log.createdAt).format()
            else if log.event == 2
                team = _.findWhere teams, id: log.data.teamId
                task = _.findWhere tasks, id: log.data.taskId
                if team? and task?
                    $el = $ renderTemplate 'log-entry-2', team: team, task: task, createdAt: moment(log.createdAt).format()

            if $el.length > 0
                @$logsContainer.prepend $el

        present: ->
            @$main = $ '#main'
            @$main.html renderTemplate 'loading-view'

            $
                .when identityProvider.fetchIdentity(), contestProvider.fetchContest(), teamProvider.fetchTeams(), taskProvider.fetchTaskPreviews()
                .done (identity, contest) =>
                    identityProvider.subscribe()
                    if dataStore.supportsRealtime()
                        dataStore.connectRealtime()

                    navigationBar.present active: 'logs'
                    statusBar.present()

                    if _.contains ['admin', 'manager'], identity.role
                        @$main.html renderTemplate 'logs-view'
                        teamProvider.subscribe()
                        taskProvider.subscribe()

                        @$logsContainer = $ '#themis-logs'

                        logProvider.subscribe()
                        @onCreateLog = (log) =>
                            @prependLog log
                            false

                        logProvider.on 'createLog', @onCreateLog

                    else
                        @$main.html renderTemplate 'access-forbidden-view', urlPath: window.location.pathname
                .fail (err) =>
                    navigationBar.present()
                    @$main.html renderTemplate 'internal-error-view'

        dismiss: ->
            identityProvider.unsubscribe()
            teamProvider.unsubscribe()
            taskProvider.unsubscribe()

            if @onCreateLog?
                logProvider.off 'createLog', @onCreateLog
                @onCreateLog = null
            logProvider.unsubscribe()

            @$main.empty()
            @$main = null
            navigationBar.dismiss()
            statusBar.dismiss()

            if dataStore.supportsRealtime()
                dataStore.disconnectRealtime()


    new LogsView()
