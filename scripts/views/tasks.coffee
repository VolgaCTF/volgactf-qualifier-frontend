define 'tasksView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'metadataStore'], ($, View, renderTemplate, dataStore, navigationBar, metadataStore) ->
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
                .when dataStore.getIdentity()
                .done (identity) ->
                    navigationBar.present
                        identity: identity
                        active: 'tasks'
                .fail (err) =>
                    navigationBar.present()
                    @$main.html renderTemplate 'internal-error-view'

        dismiss: ->
            @$main.empty()
            @$main = null
            navigationBar.dismiss()

    new TasksView()
