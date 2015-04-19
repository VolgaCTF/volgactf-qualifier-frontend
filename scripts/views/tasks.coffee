define 'tasksView', ['jquery', 'underscore', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'statusBar', 'metadataStore', 'moment', 'taskCategoryModel', 'markdown-it', 'bootstrap', 'jquery.form', 'parsley'], ($, _, View, renderTemplate, dataStore, navigationBar, statusBar, metadataStore, moment, TaskCategoryModel, MarkdownIt) ->
    class TasksView extends View
        constructor: ->
            @$main = null
            @$taskCategoriesSection = null
            @$taskCategoriesList = null

            @$taskPreviewsList = null

            @identity = null
            @contest = null
            @taskCategories = []
            @taskPreviews = []

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

        initCreateTaskModal: ->
            $createTaskModal = $ '#create-task-modal'
            $createTaskModal.modal
                show: no

            $createTaskSubmitError = $createTaskModal.find '.submit-error > p'
            $createTaskSubmitButton = $createTaskModal.find 'button[data-action="complete-create-task"]'
            $createTaskForm = $createTaskModal.find 'form'
            $createTaskForm.parsley()

            $createTaskSubmitButton.on 'click', (e) ->
                $createTaskForm.trigger 'submit'

            $createTaskTablist = $ '#create-task-tablist'
            $createTaskTabData = $createTaskTablist.find 'a[href="#create-task-data"]'
            $createTaskTabPreview = $createTaskTablist.find 'a[href="#create-task-preview"]'

            $createTaskTitle = $ '#create-task-title'
            $createTaskDescription = $ '#create-task-description'
            $createTaskValue = $ '#create-task-value'
            $createTaskCategories = $ '#create-task-categories'

            $createTaskHints = $ '#create-task-hints'
            $createTaskHintList = $ '#create-task-hint-list'

            $createTaskAnswers = $ '#create-task-answers'
            $createTaskAnswerList = $ '#create-task-answer-list'

            $createTaskCaseSensitive = $ '#create-task-case-sensitive'

            $createTaskPreview = $ '#create-task-preview'

            $createTaskTabData.tab()
            $createTaskTabPreview.tab()

            $createTaskHints.find('a[data-action="create-task-hint"]').on 'click', (e) =>
                e.preventDefault()
                number = $createTaskHintList.children().length + 1
                $createTaskHintList.append $ renderTemplate 'create-task-hint-textarea-partial', number: number

            $createTaskHintList.on 'click', 'a[data-action="remove-task-hint"]', (e) =>
                e.preventDefault()
                number = $(e.target).closest('a').attr('data-number')
                $("#create-task-hint-#{number}").remove()
                hints = []
                $createTaskHintList.find('textarea[name="hints"]').each ->
                    hints.push $(this).val()
                $createTaskHintList.empty()
                _.each hints, (hint, ndx) ->
                    $createTaskHintList.append $ renderTemplate 'create-task-hint-textarea-partial', number: ndx + 1
                    $("#create-task-hint-#{ndx + 1} textarea").val hint

            $createTaskAnswers.find('a[data-action="create-task-answer"]').on 'click', (e) =>
                e.preventDefault()
                number = $createTaskAnswerList.children().length + 1
                $createTaskAnswerList.append $ renderTemplate 'create-task-answer-input-partial', number: number

            $createTaskAnswerList.on 'click', 'a[data-action="remove-task-answer"]', (e) =>
                e.preventDefault()
                number = $(e.target).closest('a').attr('data-number')
                $("#create-task-answer-#{number}").remove()
                answers = []
                $createTaskAnswerList.find('input[name="answers"]').each ->
                    answers.push $(this).val()
                $createTaskAnswerList.empty()
                _.each answers, (answer, ndx) ->
                    $createTaskAnswerList.append $ renderTemplate 'create-task-answer-input-partial', number: ndx + 1
                    $("#create-task-answer-#{ndx + 1} input").val answer

            $createTaskTabPreview.on 'show.bs.tab', (e) ->
                md = new MarkdownIt()
                hintsFormatted = []
                $createTaskHintList.find('textarea[name="hints"]').each ->
                    hintsFormatted.push md.render $(this).val()
                options =
                    title: $createTaskTitle.val()
                    description: md.render $createTaskDescription.val()
                    hints: hintsFormatted

                $createTaskPreview.html renderTemplate 'task-content-partial', options

            $createTaskModal.on 'show.bs.modal', (e) =>
                $createTaskTabData.tab 'show'
                $createTaskTitle.val ''
                $createTaskDescription.val ''
                $createTaskValue.val ''

                $createTaskCategories.empty()
                _.each @taskCategories, (taskCategory) =>
                    $createTaskCategories.append $('<option></option>').attr('value', taskCategory.id).text taskCategory.title

                $createTaskHintList.empty()
                $createTaskAnswerList.empty()

                $createTaskCaseSensitive.val 'true'

                $createTaskSubmitError.text ''

            $createTaskModal.on 'shown.bs.modal', (e) ->
                $createTaskTitle.focus()

            $createTaskForm.on 'submit', (e) =>
                e.preventDefault()
                $createTaskForm.ajaxSubmit
                    beforeSubmit: ->
                        $createTaskSubmitError.text ''
                        $createTaskSubmitButton.prop 'disabled', yes
                    clearForm: yes
                    dataType: 'json'
                    xhrFields:
                        withCredentials: yes
                    headers: { 'X-CSRF-Token': @identity.token }
                    success: (responseText, textStatus, jqXHR) ->
                        $createTaskModal.modal 'hide'
                    error: (jqXHR, textStatus, errorThrown) ->
                        if jqXHR.responseJSON?
                            $createTaskSubmitError.text jqXHR.responseJSON
                        else
                            $createTaskSubmitError.text 'Unknown error. Please try again later.'
                    complete: ->
                        $createTaskSubmitButton.prop 'disabled', no

        initReviseTaskModal: ->
            $reviseTaskModal = $ '#revise-task-modal'
            $reviseTaskModal.modal
                show: no

            $reviseTaskSubmitError = $reviseTaskModal.find '.submit-error > p'
            $reviseTaskSubmitSuccess = $reviseTaskModal.find '.submit-success > p'
            $reviseTaskSubmitButton = $reviseTaskModal.find 'button[data-action="complete-revise-task"]'
            $reviseTaskForm = $reviseTaskModal.find 'form'
            $reviseTaskForm.parsley()

            $reviseTaskSubmitButton.on 'click', (e) ->
                $reviseTaskForm.trigger 'submit'

            $reviseTaskAnswer = $ '#revise-task-answer'
            $reviseTaskContents = $reviseTaskModal.find '.themis-task-contents'

            $reviseTaskModal.on 'show.bs.modal', (e) ->
                taskId = parseInt $(e.relatedTarget).data('task-id'), 10
                $reviseTaskModal.data 'task-id', taskId

                $reviseTaskForm.parsley().reset()
                $reviseTaskForm.attr 'action', "#{metadataStore.getMetadata 'domain-api' }/task/#{taskId}/revise"

                $reviseTaskContents.empty()
                $reviseTaskAnswer.val ''
                $reviseTaskSubmitError.text ''
                $reviseTaskSubmitSuccess.text ''
                $reviseTaskSubmitButton.prop 'disabled', yes

                $
                    .when dataStore.getTask taskId
                    .done (task) ->
                        md = new MarkdownIt()
                        hintsFormatted = []
                        _.each task.hints, (hint) ->
                            hintsFormatted.push md.render hint
                        options =
                            title: task.title
                            description: md.render task.description
                            hints: hintsFormatted
                        $reviseTaskContents.html renderTemplate 'task-content-partial', options
                        $reviseTaskSubmitButton.prop 'disabled', no
                    .fail (err) ->
                        $reviseTaskSubmitError.text err

            $reviseTaskModal.on 'shown.bs.modal', (e) ->
                $reviseTaskAnswer.focus()

            $reviseTaskForm.on 'submit', (e) =>
                e.preventDefault()
                $reviseTaskForm.ajaxSubmit
                    beforeSubmit: ->
                        $reviseTaskSubmitError.text ''
                        $reviseTaskSubmitSuccess.text ''
                        $reviseTaskSubmitButton.prop 'disabled', yes
                    clearForm: yes
                    dataType: 'json'
                    xhrFields:
                        withCredentials: yes
                    headers: { 'X-CSRF-Token': @identity.token }
                    success: (responseText, textStatus, jqXHR) ->
                        $reviseTaskSubmitSuccess.text 'Answer is correct!'
                        hideModal = ->
                            $reviseTaskModal.modal 'hide'
                        setTimeout hideModal, 1000
                    error: (jqXHR, textStatus, errorThrown) ->
                        if jqXHR.responseJSON?
                            $reviseTaskSubmitError.text jqXHR.responseJSON
                        else
                            $reviseTaskSubmitError.text 'Unknown error. Please try again later.'
                    complete: ->
                        $reviseTaskSubmitButton.prop 'disabled', no


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

        renderTaskPreviews: ->
            if @taskPreviews.length == 0
                @$taskPreviewsList.empty()
                @$taskPreviewsList.html $('<p></p>').addClass('lead').text 'No tasks yet.'
            else
                @$taskPreviewsList.empty()
                sortedTaskPreviews = _.sortBy @taskPreviews, 'createdAt'
                for taskPreview in sortedTaskPreviews
                    categoriesList = ''
                    for categoryId in taskPreview.categories
                        taskCategory = _.findWhere @taskCategories, id: categoryId
                        if taskCategory?
                            categoriesList += renderTemplate 'task-category-partial', title: taskCategory.title, description: taskCategory.description

                    options =
                        id: taskPreview.id
                        title: taskPreview.title
                        value: taskPreview.value
                        state: taskPreview.state
                        categoriesList: categoriesList

                    @$taskPreviewsList.append $ renderTemplate 'task-preview-partial', options

        present: ->
            @$main = $ '#main'
            $
                .when dataStore.getIdentity(), dataStore.getContest(), dataStore.getTaskPreviews(), dataStore.getTaskCategories()
                .done (identity, contest, taskPreviews, taskCategories) =>
                    @$main.html renderTemplate 'tasks-view', identity: identity, contest: contest
                    @$taskCategoriesSection = $ '#themis-task-categories'

                    @identity = identity
                    @contest = contest
                    @taskCategories = taskCategories
                    @taskPreviews = taskPreviews

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
                        @initReviseTaskModal()

                    if identity.role == 'admin' and not contest.isFinished()
                        @initCreateTaskCategoryModal()
                        @initEditTaskCategoryModal()
                        @initRemoveTaskCategoryModal()

                        @initCreateTaskModal()

                    @$taskPreviewsList = $ '#themis-task-previews'
                    @renderTaskPreviews()

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
            @$taskPreviewsList = null
            navigationBar.dismiss()
            statusBar.dismiss()

            @identity = null
            @contest = null
            @taskCategories = []
            @taskPreviews = []

            if dataStore.supportsRealtime()
                dataStore.disconnectRealtime()


    new TasksView()
