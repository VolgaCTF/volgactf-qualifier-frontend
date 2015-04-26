define 'taskCategoryProvider', ['jquery', 'underscore', 'dataStore', 'metadataStore', 'EventEmitter', 'taskCategoryModel'], ($, _, dataStore, metadataStore, EventEmitter, TaskCategoryModel) ->
    class TaskCategoryProvider extends EventEmitter
        constructor: ->
            super()
            @taskCategories = []

            @onCreate = null
            @onUpdate = null
            @onRemove = null

        getTaskCategories: ->
            @taskCategories

        subscribe: ->
            return unless dataStore.supportsRealtime()
            realtimeProvider = dataStore.getRealtimeProvider()

            @onCreate = (e) =>
                options = JSON.parse e.data
                taskCategory = new TaskCategoryModel options
                @taskCategories.push taskCategory
                @trigger 'createTaskCategory', [taskCategory]

            realtimeProvider.addEventListener 'createTaskCategory', @onCreate

            @onUpdate = (e) =>
                options = JSON.parse e.data
                taskCategory = new TaskCategoryModel options
                ndx = _.findIndex @taskCategories, id: taskCategory.id
                if ndx > -1
                    @taskCategories.splice ndx, 1
                @taskCategories.push taskCategory
                @trigger 'updateTaskCategory', [taskCategory]

            realtimeProvider.addEventListener 'updateTaskCategory', @onUpdate

            @onRemove = (e) =>
                options = JSON.parse e.data
                ndx = _.findIndex @taskCategories, id: options.id

                if ndx > -1
                    @taskCategories.splice ndx, 1
                    @trigger 'removeTaskCategory', [options.id]

            realtimeProvider.addEventListener 'removeTaskCategory', @onRemove

        unsubscribe: ->
            return unless dataStore.supportsRealtime()
            realtimeProvider = dataStore.getRealtimeProvider()

            if @onCreate
                realtimeProvider.removeEventListener 'createTaskCategory', @onCreate
                @onCreate = null

            if @onUpdate
                realtimeProvider.removeEventListener 'updateTaskCategory', @onUpdate
                @onUpdate = null

            if @onRemove
                realtimeProvider.removeEventListener 'removeTaskCategory', @onRemove
                @onRemove = null

            @taskCategories = []

        fetchTaskCategories: ->
            promise = $.Deferred()

            url = "#{metadataStore.getMetadata 'domain-api' }/task/category/all"
            $.ajax
                url: url
                dataType: 'json'
                xhrFields:
                    withCredentials: yes
                success: (responseJSON, textStatus, jqXHR) =>
                    @taskCategories = _.map responseJSON, (options) ->
                        new TaskCategoryModel options
                    promise.resolve @taskCategories
                error: (jqXHR, textStatus, errorThrown) ->
                    if jqXHR.responseJSON?
                        promise.reject jqXHR.responseJSON
                    else
                        promise.reject 'Unknown error. Please try again later.'

            promise

        removeTaskCategory: (id, token) ->
            promise = $.Deferred()

            url = "#{metadataStore.getMetadata 'domain-api' }/task/category/#{id}/remove"
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


    new TaskCategoryProvider()
