define 'tasksView', ['jquery', 'underscore', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'statusBar', 'metadataStore', 'moment', 'taskCategoryModel'], ($, _, View, renderTemplate, dataStore, navigationBar, statusBar, metadataStore, moment, TaskCategoryModel) ->
    class TasksView extends View
        constructor: ->
            @$main = null
            @$taskCategoriesSection = null
            @$taskCategoriesList = null

            @identity = null
            @contest = null
            @taskCategories = []

            @onCreateTaskCategory = null
            @onUpdateTaskCategory = null
            @onRemoveTaskCategory = null

            @urlRegex = /^\/tasks$/

        getTitle: ->
            "#{metadataStore.getMetadata 'event-title' } :: Tasks"

        initCreateTaskCategoryModal: ->
            $createTaskCategoryModal = $ '#create-task-category-modal'
            $createTaskCategoryModal.modal
                show: no

            $createTaskCategorySubmitError = $createTaskCategoryModal.find '.submit-error > p'
            $createTaskCategorySubmitButton = $createTaskCategoryModal.find 'button[data-action="complete-create-task-category"]'
            $createTaskCategoryForm = $createTaskCategoryModal.find 'form'
            $createTaskCategoryForm.parsley()

            $createTaskCategorySubmitButton.on 'click', (e) ->
                $createTaskCategoryForm.trigger 'submit'

            $createTaskCategoryModal.on 'show.bs.modal', (e) =>
                $createTaskCategorySubmitError.text ''

            $createTaskCategoryModal.on 'shown.bs.modal', (e) ->
                $('#create-task-category-title').focus()

            $createTaskCategoryForm.on 'submit', (e) =>
                e.preventDefault()
                $createTaskCategoryForm.ajaxSubmit
                    beforeSubmit: ->
                        $createTaskCategorySubmitError.text ''
                        $createTaskCategorySubmitButton.prop 'disabled', yes
                    clearForm: yes
                    dataType: 'json'
                    xhrFields:
                        withCredentials: yes
                    headers: { 'X-CSRF-Token': @identity.token }
                    success: (responseText, textStatus, jqXHR) ->
                        $createTaskCategoryModal.modal 'hide'
                        # window.location.reload()
                    error: (jqXHR, textStatus, errorThrown) ->
                        if jqXHR.responseJSON?
                            $createTaskCategorySubmitError.text jqXHR.responseJSON
                        else
                            $createTaskCategorySubmitError.text 'Unknown error. Please try again later.'
                    complete: ->
                        $createTaskCategorySubmitButton.prop 'disabled', no

        initEditTaskCategoryModal: ->
            $editTaskCategoryModal = $ '#edit-task-category-modal'
            $editTaskCategoryModal.modal
                show: no

            $editTaskCategorySubmitError = $editTaskCategoryModal.find '.submit-error > p'
            $editTaskCategorySubmitButton = $editTaskCategoryModal.find 'button[data-action="complete-edit-task-category"]'
            $editTaskCategoryForm = $editTaskCategoryModal.find 'form'
            $editTaskCategoryForm.parsley()

            $editTaskCategorySubmitButton.on 'click', (e) ->
                $editTaskCategoryForm.trigger 'submit'

            $editTaskCategoryTitle = $ '#edit-task-category-title'
            $editTaskCategoryDescription = $ '#edit-task-category-description'

            $editTaskCategoryModal.on 'show.bs.modal', (e) =>
                taskCategoryId = parseInt $(e.relatedTarget).data('task-category-id'), 10
                taskCategory = _.findWhere @taskCategories, id: taskCategoryId

                $editTaskCategoryForm.attr 'action', "#{metadataStore.getMetadata 'domain-api' }/task/category/#{taskCategoryId}/update"
                $editTaskCategoryTitle.val taskCategory.title
                $editTaskCategoryDescription.val taskCategory.description
                $editTaskCategorySubmitError.text ''

            $editTaskCategoryModal.on 'shown.bs.modal', (e) ->
                $editTaskCategoryTitle.focus()

            $editTaskCategoryForm.on 'submit', (e) =>
                e.preventDefault()
                $editTaskCategoryForm.ajaxSubmit
                    beforeSubmit: ->
                        $editTaskCategorySubmitError.text ''
                        $editTaskCategorySubmitButton.prop 'disabled', yes
                    clearForm: yes
                    dataType: 'json'
                    xhrFields:
                        withCredentials: yes
                    headers: { 'X-CSRF-Token': @identity.token }
                    success: (responseText, textStatus, jqXHR) ->
                        $editTaskCategoryModal.modal 'hide'
                    error: (jqXHR, textStatus, errorThrown) ->
                        if jqXHR.responseJSON?
                            $editTaskCategorySubmitError.text jqXHR.responseJSON
                        else
                            $editTaskCategorySubmitError.text 'Unknown error. Please try again later.'
                    complete: ->
                        $editTaskCategorySubmitButton.prop 'disabled', no

        initRemoveTaskCategoryModal: ->
            $removeTaskCategoryModal = $ '#remove-task-category-modal'
            $removeTaskCategoryModal.modal
                show: no

            $removeTaskCategoryModalBody = $removeTaskCategoryModal.find '.modal-body p.confirmation'
            $removeTaskCategorySubmitError = $removeTaskCategoryModal.find '.submit-error > p'
            $removeTaskCategorySubmitButton = $removeTaskCategoryModal.find 'button[data-action="complete-remove-task-category"]'

            $removeTaskCategoryModal.on 'show.bs.modal', (e) =>
                taskCategoryId = parseInt $(e.relatedTarget).data('task-category-id'), 10
                $removeTaskCategoryModal.data 'task-category-id', taskCategoryId
                taskCategory = _.findWhere @taskCategories, id: taskCategoryId
                $removeTaskCategoryModalBody.html renderTemplate 'remove-task-category-confirmation', title: taskCategory.title
                $removeTaskCategorySubmitError.text ''

            $removeTaskCategorySubmitButton.on 'click', (e) =>
                taskCategoryId = $removeTaskCategoryModal.data 'task-category-id'
                $
                    .when dataStore.removeTaskCategory taskCategoryId, @identity.token
                    .done ->
                        $removeTaskCategoryModal.modal 'hide'
                    .fail (err) ->
                        $removeTaskCategorySubmitError.text err

        renderTaskCategories: ->
            if @taskCategories.length == 0
                @$taskCategoriesList.empty()
                @$taskCategoriesList.html $('<p></p>').addClass('lead').text 'No task categories yet.'
            else
                @$taskCategoriesList.empty()
                sortedTaskCategories = _.sortBy @taskCategories, 'createdAt'
                manageable = @identity.role is 'admin' and not @contest.isFinished()
                for taskCategory in sortedTaskCategories
                    options =
                        id: taskCategory.id
                        title: taskCategory.title
                        description: taskCategory.description
                        updatedAt: moment(taskCategory.updatedAt).format 'lll'
                        manageable: manageable

                    @$taskCategoriesList.append $ renderTemplate 'task-category-supervisor-partial', options

        present: ->
            @$main = $ '#main'
            @$main.html renderTemplate 'tasks-view'

            @$taskCategoriesSection = $ '#themis-task-categories'

            $
                .when dataStore.getIdentity(), dataStore.getContest(), dataStore.getTaskCategories()
                .done (identity, contest, taskCategories) =>
                    @identity = identity
                    @contest = contest
                    @taskCategories = taskCategories

                    if dataStore.supportsRealtime()
                        dataStore.connectRealtime()

                    navigationBar.present
                        identity: identity
                        active: 'tasks'

                    statusBar.present
                        identity: identity
                        contest: contest

                    if _.contains ['admin', 'manager'], identity.role
                        @$taskCategoriesSection.html renderTemplate 'task-categories-view', identity: identity, contest: contest
                        @$taskCategoriesList = $ '#themis-task-categories-list'
                        @renderTaskCategories()

                    if identity.role == 'admin' and not contest.isFinished()
                        @initCreateTaskCategoryModal()
                        @initEditTaskCategoryModal()
                        @initRemoveTaskCategoryModal()

                    if dataStore.supportsRealtime()
                        @onCreateTaskCategory = (e) =>
                            data = JSON.parse e.data
                            taskCategory = new TaskCategoryModel data
                            @taskCategories.push taskCategory
                            if _.contains ['admin', 'manager'], identity.role
                                @renderTaskCategories()

                        dataStore.getRealtimeProvider().addEventListener 'createTaskCategory', @onCreateTaskCategory

                        @onUpdateTaskCategory = (e) =>
                            data = JSON.parse e.data
                            taskCategory = _.findWhere @taskCategories, id: data.id

                            if taskCategory?
                                taskCategory.title = data.title
                                taskCategory.description = data.description
                                taskCategory.updatedAt = new Date data.updatedAt
                                if _.contains ['admin', 'manager'], identity.role
                                    @renderTaskCategories()

                        dataStore.getRealtimeProvider().addEventListener 'updateTaskCategory', @onUpdateTaskCategory

                        @onRemoveTaskCategory = (e) =>
                            taskCategory = JSON.parse e.data
                            ndx = _.findIndex @taskCategories, id: taskCategory.id

                            if ndx > -1
                                @taskCategories.splice ndx, 1
                                if _.contains ['admin', 'manager'], identity.role
                                    @renderTaskCategories()

                        dataStore.getRealtimeProvider().addEventListener 'removeTaskCategory', @onRemoveTaskCategory

                .fail (err) =>
                    navigationBar.present()
                    @$main.html renderTemplate 'internal-error-view'

        dismiss: ->
            if dataStore.supportsRealtime()
                if @onCreateTaskCategory?
                    dataStore.getRealtimeProvider().removeEventListener 'createTaskCategory', @onCreateTaskCategory
                    @onCreateTaskCategory = null
                if @onUpdateTaskCategory?
                    dataStore.getRealtimeProvider().removeEventListener 'updateTaskCategory', @onUpdateTaskCategory
                    @onUpdateTaskCategory = null
                if @onRemoveTaskCategory?
                    dataStore.getRealtimeProvider().removeEventListener 'removeTaskCategory', @onRemoveTaskCategory
                    @onRemoveTaskCategory = null

            @$main.empty()
            @$main = null
            @$taskCategoriesSection = null
            @$taskCategoriesList = null
            navigationBar.dismiss()
            statusBar.dismiss()

            @identity = null
            @contest = null
            @taskCategories = []

            if dataStore.supportsRealtime()
                dataStore.disconnectRealtime()


    new TasksView()
