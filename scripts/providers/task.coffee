define 'taskProvider', ['jquery', 'underscore', 'EventEmitter', 'dataStore', 'metadataStore', 'taskPreviewModel', 'taskModel', 'identityProvider', 'taskFullModel'], ($, _, EventEmitter, dataStore, metadataStore, TaskPreviewModel, TaskModel, identityProvider, TaskFullModel) ->
    class TaskProvider extends EventEmitter
        constructor: ->
            super()
            @taskPreviews = []

            @onCreateTask = null
            @onOpenTask = null
            @onCloseTask = null
            @onUpdateTask = null

        getTaskPreviews: ->
            @taskPreviews

        subscribe: ->
            return unless dataStore.supportsRealtime()
            realtimeProvider = dataStore.getRealtimeProvider()

            isSupervisor = _.contains ['admin', 'manager'], identityProvider.getIdentity().role
            if isSupervisor
                @onCreateTask = (e) =>
                    options = JSON.parse e.data
                    taskPreview = new TaskPreviewModel options
                    @taskPreviews.push taskPreview
                    @trigger 'createTask', [taskPreview]

                realtimeProvider.addEventListener 'createTask', @onCreateTask

            @onOpenTask = (e) =>
                options = JSON.parse e.data
                taskPreview = new TaskPreviewModel options
                ndx = _.findIndex @taskPreviews, id: options.id
                if ndx > -1
                    @taskPreviews.splice ndx, 1
                @taskPreviews.push taskPreview
                @trigger 'openTask', [taskPreview]

            realtimeProvider.addEventListener 'openTask', @onOpenTask

            @onCloseTask = (e) =>
                options = JSON.parse e.data
                taskPreview = new TaskPreviewModel options
                ndx = _.findIndex @taskPreviews, id: options.id
                if ndx > -1
                    @taskPreviews.splice ndx, 1
                @taskPreviews.push taskPreview
                @trigger 'closeTask', [taskPreview]

            realtimeProvider.addEventListener 'closeTask', @onCloseTask

            @onUpdateTask = (e) =>
                options = JSON.parse e.data
                taskPreview = new TaskPreviewModel options
                ndx = _.findIndex @taskPreviews, id: options.id
                if ndx > -1
                    @taskPreviews.splice ndx, 1
                @taskPreviews.push taskPreview
                @trigger 'updateTask', [taskPreview]

            realtimeProvider.addEventListener 'updateTask', @onUpdateTask

        unsubscribe: ->
            return unless dataStore.supportsRealtime()
            realtimeProvider = dataStore.getRealtimeProvider()

            if @onCreateTask?
                realtimeProvider.removeEventListener 'createTask', @onCreate
                @onCreateTask = null
            if @onOpenTask?
                realtimeProvider.removeEventListener 'openTask', @onOpen
                @onOpenTask = null
            if @onCloseTask?
                realtimeProvider.removeEventListener 'closeTask', @onClose
                @onCloseTask = null
            if @onUpdateTask?
                realtimeProvider.removeEventListener 'updateTask', @onUpdate
                @onUpdateTask = null

            @taskPreviews = []

        fetchTaskPreviews: ->
            promise = $.Deferred()

            url = "#{metadataStore.getMetadata 'domain-api' }/task/all"
            $.ajax
                url: url
                dataType: 'json'
                xhrFields:
                    withCredentials: yes
                success: (responseJSON, textStatus, jqXHR) =>
                    @taskPreviews = _.map responseJSON, (options) ->
                        new TaskPreviewModel options
                    promise.resolve @taskPreviews
                error: (jqXHR, textStatus, errorThrown) ->
                    if jqXHR.responseJSON?
                        promise.reject jqXHR.responseJSON
                    else
                        promise.reject 'Unknown error. Please try again later.'

            promise

        fetchTask: (taskId, options = {}) ->
            defaultOptions = full: no
            options = _.extend defaultOptions, options
            promise = $.Deferred()

            if options.full
                url = "#{metadataStore.getMetadata 'domain-api' }/task/#{taskId}/full"
            else
                url = "#{metadataStore.getMetadata 'domain-api' }/task/#{taskId}"

            $.ajax
                url: url
                dataType: 'json'
                xhrFields:
                    withCredentials: yes
                success: (responseJSON, textStatus, jqXHR) ->
                    if options.full
                        res = new TaskFullModel responseJSON
                    else
                        res = new TaskModel responseJSON
                    promise.resolve res
                error: (jqXHR, textStatus, errorThrown) ->
                    if jqXHR.responseJSON?
                        promise.reject jqXHR.responseJSON
                    else
                        promise.reject 'Unknown error. Please try again later.'

            promise

        openTask: (id, token) ->
            promise = $.Deferred()

            url = "#{metadataStore.getMetadata 'domain-api' }/task/#{id}/open"
            $.ajax
                url: url
                type: 'POST'
                dataType: 'json'
                data: {}
                xhrFields:
                    withCredentials: yes
                headers: { 'X-CSRF-Token': token }
                success: (responseJSON, textStatus, jqXHR) ->
                    promise.resolve()
                error: (jqXHR, textStatus, errorThrown) ->
                    if jqXHR.responseJSON?
                        promise.reject jqXHR.responseJSON
                    else
                        promise.reject 'Unknown error. Please try again later.'

            promise

        closeTask: (id, token) ->
            promise = $.Deferred()

            url = "#{metadataStore.getMetadata 'domain-api' }/task/#{id}/close"
            $.ajax
                url: url
                type: 'POST'
                dataType: 'json'
                data: {}
                xhrFields:
                    withCredentials: yes
                headers: { 'X-CSRF-Token': token }
                success: (responseJSON, textStatus, jqXHR) ->
                    promise.resolve()
                error: (jqXHR, textStatus, errorThrown) ->
                    if jqXHR.responseJSON?
                        promise.reject jqXHR.responseJSON
                    else
                        promise.reject 'Unknown error. Please try again later.'

            promise

    new TaskProvider()
