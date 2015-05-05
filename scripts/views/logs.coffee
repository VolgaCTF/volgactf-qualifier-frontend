define 'logsView', ['jquery', 'underscore', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'statusBar', 'metadataStore', 'contestProvider', 'identityProvider', 'teamProvider', 'taskProvider', 'logProvider', 'moment', 'jquery.history'], ($, _, View, renderTemplate, dataStore, navigationBar, statusBar, metadataStore, contestProvider, identityProvider, teamProvider, taskProvider, logProvider, moment, History) ->
    class LogsView extends View
        constructor: ->
            @$main = null

            @onCreateLog = null
            @$section = null
            @$logsContainer = null

            @urlRegex = /^\/logs$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: Logs"

        renderLog: (log, teams, tasks) ->
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

            $el

        renderLogs: ->
            logs = logProvider.getLogs()
            teams = teamProvider.getTeams()
            tasks = taskProvider.getTaskPreviews()

            sortedLogs = _.sortBy logs, 'createdAt'
            logsContainerDetached = @$logsContainer.detach()

            for log in sortedLogs
                $el = @renderLog log, teams, tasks
                if $el?.length > 0
                    logsContainerDetached.append $el

            logsContainerDetached.appendTo @$section
            logsContainerDetached = null
            @$logsContainer = $ '#themis-logs'

        prependLog: (log) ->
            teams = teamProvider.getTeams()
            tasks = taskProvider.getTaskPreviews()

            $el = @renderLog log, teams, tasks
            if $el?.length > 0
                @$logsContainer.prepend $el

        present: ->
            @$main = $ '#main'
            @$main.html renderTemplate 'loading-view'

            $
                .when identityProvider.fetchIdentity(), contestProvider.fetchContest()
                .done (identity, contest) =>
                    if _.contains ['admin', 'manager'], identity.role
                        params = History.getState().data.params
                        all = 'all' of params

                        if all
                            promise = $.when teamProvider.fetchTeams(), taskProvider.fetchTaskPreviews(), logProvider.fetchLogs()
                        else
                            promise = $.when teamProvider.fetchTeams(), taskProvider.fetchTaskPreviews()

                        promise
                            .done =>
                                identityProvider.subscribe()
                                if dataStore.supportsRealtime()
                                    dataStore.connectRealtime()

                                navigationBar.present active: 'logs'
                                statusBar.present()

                                @$main.html renderTemplate 'logs-view'
                                teamProvider.subscribe()
                                taskProvider.subscribe()

                                @$section = @$main.find 'section'
                                @$logsContainer = $ '#themis-logs'

                                if all
                                    @renderLogs()

                                logProvider.subscribe()
                                @onCreateLog = (log) =>
                                    @prependLog log
                                    false

                                logProvider.on 'createLog', @onCreateLog
                            .fail (err) =>
                                navigationBar.present()
                                @$main.html renderTemplate 'internal-error-view'
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

            @$section = null
            @$logsContainer = null

            @$main.empty()
            @$main = null
            navigationBar.dismiss()
            statusBar.dismiss()

            if dataStore.supportsRealtime()
                dataStore.disconnectRealtime()


    new LogsView()
