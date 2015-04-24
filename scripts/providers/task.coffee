define 'taskProvider', ['jquery', 'underscore', 'EventEmitter', 'dataStore', 'metadataStore', 'taskPreviewModel', 'taskModel', 'identityProvider'], ($, _, EventEmitter, dataStore, metadataStore, TaskPreviewModel, TaskModel, identityProvider) ->
    class TaskProvider extends EventEmitter
        constructor: ->
            super()
            @taskPreviews = []

            @onCreate = null
            @onOpen = null
            @onClose = null

        getTaskPreviews: ->
            @taskPreviews

        subscribe: ->
            return unless dataStore.supportsRealtime()
            realtimeProvider = dataStore.getRealtimeProvider()

            isSupervisor = _.contains ['admin', 'manager'], identityProvider.getIdentity().role
            if isSupervisor
                @onCreate = (e) =>
                    options = JSON.parse e.data
                    taskPreview = new TaskPreviewModel options
                    @taskPreviews.push taskPreview
                    @trigger 'createTask', [taskPreview]

                realtimeProvider.addEventListener 'createTask', @onCreate

            @onOpen = (e) =>
                options = JSON.parse e.data
                taskPreview = new TaskPreviewModel options
                ndx = _.findIndex @taskPreviews, id: options.id
                if ndx > -1
                    @taskPreviews.splice ndx, 1
                @taskPreviews.push taskPreview
                @trigger 'openTask', [taskPreview]

            realtimeProvider.addEventListener 'openTask', @onOpen

            @onClose = (e) =>
                options = JSON.parse e.data
                taskPreview = new TaskPreviewModel options
                ndx = _.findIndex @taskPreviews, id: options.id
                if ndx > -1
                    @taskPreviews.splice ndx, 1
                @taskPreviews.push taskPreview
                @trigger 'closeTask', [taskPreview]

            realtimeProvider.addEventListener 'closeTask', @onClose

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

        fetchTask: (taskId) ->
            promise = $.Deferred()

            url = "#{metadataStore.getMetadata 'domain-api' }/task/#{taskId}"
            $.ajax
                url: url
                dataType: 'json'
                xhrFields:
                    withCredentials: yes
                success: (responseJSON, textStatus, jqXHR) ->
                    promise.resolve new TaskModel responseJSON
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
