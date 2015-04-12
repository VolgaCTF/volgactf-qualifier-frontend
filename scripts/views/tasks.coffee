define 'tasksView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'metadataStore'], ($, View, renderTemplate, dataStore, navigationBar, metadataStore) ->
    class TasksView extends View
        constructor: ->
            @urlRegex = /^\/tasks$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: Tasks"

        present: ->
            $main = $ '#main'
            $('#main').html renderTemplate 'tasks-view'

            dataStore.getIdentity (err, identity) ->
                if err?
                    $main.html renderTemplate 'internal-error-view'
                    navigationBar.present()
                else
                    navigationBar.present
                        identity: identity
                        active: 'tasks'

        dismiss: ->
            $('#main').empty()
            navigationBar.dismiss()

    new TasksView()
