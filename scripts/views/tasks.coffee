define 'tasksView', ['jquery', 'underscore', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'statusBar', 'metadataStore', 'moment', 'taskCategoryModel', 'taskPreviewModel', 'taskCategoryProvider', 'taskProvider', 'contestProvider', 'identityProvider', 'teamProvider', 'markdown-it', 'bootstrap', 'jquery.form', 'parsley'], ($, _, View, renderTemplate, dataStore, navigationBar, statusBar, metadataStore, moment, TaskCategoryModel, TaskPreviewModel, taskCategoryProvider, taskProvider, contestProvider, identityProvider, teamProvider, MarkdownIt) ->
    class TasksView extends View
        constructor: ->
            @$main = null
            @$taskCategoriesSection = null
            @$taskCategoriesList = null

            @$taskPreviewsList = null

            @onCreateTaskCategory = null
            @onUpdateTaskCategory = null
            @onRemoveTaskCategory = null

            @onCreateTask = null
            @onOpenTask = null
            @onCloseTask = null
            @onUpdateTask = null

            @onCreateTeamTaskProgress = null
            @onUpdateContest = null

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
                $createTaskCategoryForm.parsley().reset()

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
                    headers: { 'X-CSRF-Token': identityProvider.getIdentity().token }
                    success: (responseText, textStatus, jqXHR) ->
                        $createTaskCategoryModal.modal 'hide'
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

            $editTaskCategoryModal.on 'show.bs.modal', (e) ->
                taskCategoryId = parseInt $(e.relatedTarget).data('task-category-id'), 10
                taskCategory = _.findWhere taskCategoryProvider.getTaskCategories(), id: taskCategoryId

                $editTaskCategoryForm.attr 'action', "#{metadataStore.getMetadata 'domain-api' }/task/category/#{taskCategoryId}/update"
                $editTaskCategoryTitle.val taskCategory.title
                $editTaskCategoryDescription.val taskCategory.description
                $editTaskCategorySubmitError.text ''
                $editTaskCategoryForm.parsley().reset()

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
                    headers: { 'X-CSRF-Token': identityProvider.getIdentity().token }
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
                taskCategory = _.findWhere taskCategoryProvider.getTaskCategories(), id: taskCategoryId
                $removeTaskCategoryModalBody.html renderTemplate 'remove-task-category-confirmation', title: taskCategory.title
                $removeTaskCategorySubmitError.text ''

            $removeTaskCategorySubmitButton.on 'click', (e) =>
                taskCategoryId = $removeTaskCategoryModal.data 'task-category-id'
                $
                    .when taskCategoryProvider.removeTaskCategory taskCategoryId, identityProvider.getIdentity().token
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
                _.each taskCategoryProvider.getTaskCategories(), (taskCategory) =>
                    $createTaskCategories.append $('<option></option>').attr('value', taskCategory.id).text taskCategory.title

                $createTaskHintList.empty()
                $createTaskAnswerList.empty()

                $createTaskCaseSensitive.val 'true'

                $createTaskSubmitError.text ''
                $createTaskForm.parsley().reset()

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
                    headers: { 'X-CSRF-Token': identityProvider.getIdentity().token }
                    success: (responseText, textStatus, jqXHR) ->
                        $createTaskModal.modal 'hide'
                    error: (jqXHR, textStatus, errorThrown) ->
                        if jqXHR.responseJSON?
                            $createTaskSubmitError.text jqXHR.responseJSON
                        else
                            $createTaskSubmitError.text 'Unknown error. Please try again later.'
                    complete: ->
                        $createTaskSubmitButton.prop 'disabled', no

        initEditTaskModal: ->
            $editTaskModal = $ '#edit-task-modal'
            $editTaskModal.modal
                show: no

            $editTaskSubmitError = $editTaskModal.find '.submit-error > p'
            $editTaskSubmitButton = $editTaskModal.find 'button[data-action="complete-edit-task"]'
            $editTaskForm = $editTaskModal.find 'form'
            $editTaskForm.parsley()

            $editTaskSubmitButton.on 'click', (e) ->
                $editTaskForm.trigger 'submit'

            $editTaskTablist = $ '#edit-task-tablist'
            $editTaskTabData = $editTaskTablist.find 'a[href="#edit-task-data"]'
            $editTaskTabPreview = $editTaskTablist.find 'a[href="#edit-task-preview"]'

            $editTaskTitle = $ '#edit-task-title'
            $editTaskDescription = $ '#edit-task-description'
            $editTaskValue = $ '#edit-task-value'
            $editTaskCategories = $ '#edit-task-categories'

            $editTaskHints = $ '#edit-task-hints'
            $editTaskHintList = $ '#edit-task-hint-list'

            $editTaskAnswers = $ '#edit-task-answers'
            $editTaskAnswerList = $ '#edit-task-answer-list'

            $editTaskCaseSensitive = $ '#edit-task-case-sensitive'

            $editTaskPreview = $ '#edit-task-preview'

            $editTaskTabData.tab()
            $editTaskTabPreview.tab()

            $editTaskHints.find('a[data-action="create-task-hint"]').on 'click', (e) =>
                e.preventDefault()
                number = $editTaskHintList.children().length + 1
                $editTaskHintList.append $ renderTemplate 'edit-task-hint-textarea-partial', number: number

            $editTaskHintList.on 'click', 'a[data-action="remove-task-hint"]', (e) =>
                e.preventDefault()
                number = $(e.target).closest('a').attr('data-number')
                $("#edit-task-hint-#{number}").remove()
                hints = []
                $editTaskHintList.find('textarea[name="hints"]').each ->
                    $el = $ @
                    hints.push $el.val()
                $editTaskHintList.empty()
                _.each hints, (hint, ndx) ->
                    $editTaskHintList.append $ renderTemplate 'edit-task-hint-textarea-partial', number: ndx + 1
                    $("#edit-task-hint-#{ndx + 1} textarea").val hint

            $editTaskAnswers.find('a[data-action="create-task-answer"]').on 'click', (e) =>
                e.preventDefault()
                number = $editTaskAnswerList.children().length + 1
                $editTaskAnswerList.append $ renderTemplate 'edit-task-answer-input-partial', number: number, editable: yes

            $editTaskAnswerList.on 'click', 'a[data-action="remove-task-answer"]', (e) =>
                e.preventDefault()
                number = $(e.target).closest('a').attr('data-number')
                $("#edit-task-answer-#{number}").remove()
                answerParams = []
                $editTaskAnswerList.find('input[name="answers"]').each ->
                    $el = $ @
                    answerParams.push
                        value: $el.val()
                        editable: not $el.prop 'disabled'

                $editTaskAnswerList.empty()
                _.each answerParams, (answerParam, ndx) ->
                    $editTaskAnswerList.append $ renderTemplate 'edit-task-answer-input-partial', number: ndx + 1, editable: answerParam.editable
                    $("#edit-task-answer-#{ndx + 1} input").val answerParam.value

            $editTaskTabPreview.on 'show.bs.tab', (e) ->
                md = new MarkdownIt()
                hintsFormatted = []
                $editTaskHintList.find('textarea[name="hints"]').each ->
                    hintsFormatted.push md.render $(this).val()
                options =
                    title: $editTaskTitle.val()
                    description: md.render $editTaskDescription.val()
                    hints: hintsFormatted

                $editTaskPreview.html renderTemplate 'task-content-partial', options

            $editTaskModal.on 'show.bs.modal', (e) =>
                taskId = parseInt $(e.relatedTarget).data('task-id'), 10
                $editTaskModal.data 'task-id', taskId

                $editTaskTabData.tab 'show'
                $editTaskTitle.val ''
                $editTaskDescription.val ''
                $editTaskValue.val ''

                $editTaskCategories.empty()
                _.each taskCategoryProvider.getTaskCategories(), (taskCategory) =>
                    $editTaskCategories.append $('<option></option>').attr('value', taskCategory.id).text taskCategory.title

                $editTaskHintList.empty()
                $editTaskAnswerList.empty()

                $editTaskCaseSensitive.val 'true'

                $editTaskSubmitError.text ''
                $editTaskForm.parsley().reset()
                $editTaskForm.attr 'action', "#{metadataStore.getMetadata 'domain-api' }/task/#{taskId}/update"

                $editTaskSubmitButton.prop 'disabled', yes

                $
                    .when taskProvider.fetchTask taskId, full: yes
                    .done (task) ->
                        $editTaskSubmitButton.prop 'disabled', no

                        $editTaskTitle.val task.title
                        $editTaskDescription.val task.description
                        $editTaskValue.val task.value
                        $editTaskCategories.val task.categories
                        $editTaskCaseSensitive.val task.caseSensitive.toString()

                        $editTaskHintList.empty()
                        _.each task.hints, (hint, ndx) ->
                            $editTaskHintList.append $ renderTemplate 'edit-task-hint-textarea-partial', number: ndx + 1, editable: no
                            $("#edit-task-hint-#{ndx + 1} textarea").val hint

                        $editTaskAnswerList.empty()
                        _.each task.answers, (answer, ndx) ->
                            $editTaskAnswerList.append $ renderTemplate 'edit-task-answer-input-partial', number: ndx + 1, editable: no
                            $("#edit-task-answer-#{ndx + 1} input").val answer


                    .fail (err) ->
                        $editTaskSubmitError.text err


            $editTaskModal.on 'shown.bs.modal', (e) ->
                $editTaskTitle.focus()

            $editTaskForm.on 'submit', (e) =>
                e.preventDefault()
                $editTaskForm.ajaxSubmit
                    beforeSubmit: ->
                        $editTaskSubmitError.text ''
                        $editTaskSubmitButton.prop 'disabled', yes
                    clearForm: yes
                    dataType: 'json'
                    xhrFields:
                        withCredentials: yes
                    headers: { 'X-CSRF-Token': identityProvider.getIdentity().token }
                    success: (responseText, textStatus, jqXHR) ->
                        $editTaskModal.modal 'hide'
                    error: (jqXHR, textStatus, errorThrown) ->
                        if jqXHR.responseJSON?
                            $editTaskSubmitError.text jqXHR.responseJSON
                        else
                            $editTaskSubmitError.text 'Unknown error. Please try again later.'
                    complete: ->
                        $editTaskSubmitButton.prop 'disabled', no

        initReviseTaskModal: ->
            $reviseTaskModal = $ '#revise-task-modal'
            $reviseTaskModal.modal
                show: no

            $reviseTaskSubmitError = $reviseTaskModal.find '.submit-error > p'
            $reviseTaskSubmitSuccess = $reviseTaskModal.find '.submit-success > p'
            $reviseTaskStatus = $reviseTaskModal.find '#revise-task-status'
            $reviseTaskSubmitButton = $reviseTaskModal.find 'button[data-action="complete-revise-task"]'
            $reviseTaskForm = $reviseTaskModal.find 'form'
            $reviseTaskForm.parsley()

            $reviseTaskSubmitButton.on 'click', (e) ->
                $reviseTaskForm.trigger 'submit'

            $reviseTaskAnswerGroup = $ '#revise-task-answer-group'
            $reviseTaskAnswer = $ '#revise-task-answer'
            $reviseTaskContents = $reviseTaskModal.find '.themis-task-contents'

            $reviseTaskModal.on 'show.bs.modal', (e) ->
                taskId = parseInt $(e.relatedTarget).data('task-id'), 10
                $reviseTaskModal.data 'task-id', taskId

                $reviseTaskForm.parsley().reset()
                $reviseTaskForm.attr 'action', "#{metadataStore.getMetadata 'domain-api' }/task/#{taskId}/revise"

                $reviseTaskContents.empty()
                $reviseTaskAnswerGroup.show()
                $reviseTaskSubmitButton.show()
                $reviseTaskAnswer.val ''
                $reviseTaskSubmitError.text ''
                $reviseTaskSubmitSuccess.text ''
                $reviseTaskStatus.text ''
                $reviseTaskSubmitButton.prop 'disabled', yes

                $
                    .when taskProvider.fetchTask taskId
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

                        teamTaskProgressEntries = _.where contestProvider.getTeamTaskProgressEntries(), taskId: task.id
                        sortedTeamTaskProgressEntries = _.sortBy teamTaskProgressEntries, 'createdAt'
                        teamIds = _.map sortedTeamTaskProgressEntries, (entry) -> entry.teamId
                        teamNames = []
                        teams = teamProvider.getTeams()
                        for teamId in teamIds
                            team = _.findWhere teams, id: teamId
                            if team?
                                teamNames.push team.name

                        $reviseTaskStatus.html renderTemplate 'revise-task-status-partial', teamNames: teamNames

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
                    headers: { 'X-CSRF-Token': identityProvider.getIdentity().token }
                    success: (responseText, textStatus, jqXHR) ->
                        $reviseTaskAnswerGroup.hide()
                        $reviseTaskSubmitButton.hide()
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

        initOpenTaskModal: ->
            $openTaskModal = $ '#open-task-modal'
            $openTaskModal.modal
                show: no

            $openTaskModalBody = $openTaskModal.find '.modal-body p.confirmation'
            $openTaskSubmitError = $openTaskModal.find '.submit-error > p'
            $openTaskSubmitButton = $openTaskModal.find 'button[data-action="complete-open-task"]'

            $openTaskModal.on 'show.bs.modal', (e) =>
                taskId = parseInt $(e.relatedTarget).data('task-id'), 10
                $openTaskModal.data 'task-id', taskId
                taskPreview = _.findWhere taskProvider.getTaskPreviews(), id: taskId
                $openTaskModalBody.html renderTemplate 'open-task-confirmation', title: taskPreview.title
                $openTaskSubmitError.text ''

            $openTaskSubmitButton.on 'click', (e) =>
                taskId = $openTaskModal.data 'task-id'
                $
                    .when taskProvider.openTask taskId, identityProvider.getIdentity().token
                    .done ->
                        $openTaskModal.modal 'hide'
                    .fail (err) ->
                        $openTaskSubmitError.text err

        initCloseTaskModal: ->
            $closeTaskModal = $ '#close-task-modal'
            $closeTaskModal.modal
                show: no

            $closeTaskModalBody = $closeTaskModal.find '.modal-body p.confirmation'
            $closeTaskSubmitError = $closeTaskModal.find '.submit-error > p'
            $closeTaskSubmitButton = $closeTaskModal.find 'button[data-action="complete-close-task"]'

            $closeTaskModal.on 'show.bs.modal', (e) =>
                taskId = parseInt $(e.relatedTarget).data('task-id'), 10
                $closeTaskModal.data 'task-id', taskId
                taskPreview = _.findWhere taskProvider.getTaskPreviews(), id: taskId
                $closeTaskModalBody.html renderTemplate 'close-task-confirmation', title: taskPreview.title
                $closeTaskSubmitError.text ''

            $closeTaskSubmitButton.on 'click', (e) =>
                taskId = $closeTaskModal.data 'task-id'
                $
                    .when taskProvider.closeTask taskId, identityProvider.getIdentity().token
                    .done ->
                        $closeTaskModal.modal 'hide'
                    .fail (err) ->
                        $closeTaskSubmitError.text err

        initSubmitTaskModal: ->
            $submitTaskModal = $ '#submit-task-modal'
            $submitTaskModal.modal
                show: no

            $submitTaskSubmitError = $submitTaskModal.find '.submit-error > p'
            $submitTaskInfo = $submitTaskModal.find '.submit-info > p'
            $submitTaskSubmitSuccess = $submitTaskModal.find '.submit-success > p'
            $submitTaskSubmitButton = $submitTaskModal.find 'button[data-action="complete-submit-task"]'
            $submitTaskForm = $submitTaskModal.find 'form'
            $submitTaskForm.parsley()

            $submitTaskSubmitButton.on 'click', (e) ->
                $submitTaskForm.trigger 'submit'

            $submitTaskAnswerGroup = $ '#submit-task-answer-group'
            $submitTaskAnswer = $ '#submit-task-answer'
            $submitTaskContents = $submitTaskModal.find '.themis-task-contents'

            $submitTaskModal.on 'show.bs.modal', (e) =>
                taskId = parseInt $(e.relatedTarget).data('task-id'), 10

                $submitTaskContents.empty()
                $submitTaskAnswer.val ''
                $submitTaskSubmitError.text ''
                $submitTaskInfo.text ''
                $submitTaskSubmitSuccess.text ''
                $submitTaskSubmitButton.prop 'disabled', yes

                taskPreview = _.findWhere taskProvider.getTaskPreviews(), id: taskId
                identity = identityProvider.getIdentity()

                if taskPreview? and identity.role is 'team'
                    if identity.emailConfirmed
                        taskIsSolved = no
                        taskProgress = null
                        contest = contestProvider.getContest()
                        taskProgress = _.findWhere contestProvider.getTeamTaskProgressEntries(), teamId: identity.id, taskId: taskId
                        if taskProgress?
                            taskIsSolved = yes

                        if taskPreview.isOpened() and not taskIsSolved and contest.isStarted()
                            $submitTaskAnswerGroup.show()
                            $submitTaskSubmitButton.show()
                        else
                            $submitTaskAnswerGroup.hide()
                            $submitTaskSubmitButton.hide()
                            if contest.isPaused() and not taskIsSolved
                                $submitTaskSubmitError.text 'Contest has been paused.'
                            if taskPreview.isClosed()
                                $submitTaskSubmitError.text 'Task has been closed by the event organizers.'
                            if taskIsSolved
                                $submitTaskSubmitSuccess.text "Your team has solved the task on #{moment(taskProgress.createdAt).format 'lll' }!"
                    else
                        $submitTaskSubmitError.text 'You should confirm your email before you can submit an answer to the task.'
                        $submitTaskAnswerGroup.hide()
                        $submitTaskSubmitButton.hide()
                else
                    $submitTaskAnswerGroup.hide()
                    $submitTaskSubmitButton.hide()

                $submitTaskModal.data 'task-id', taskId

                $submitTaskForm.parsley().reset()
                $submitTaskForm.attr 'action', "#{metadataStore.getMetadata 'domain-api' }/task/#{taskId}/submit"

                $
                    .when taskProvider.fetchTask(taskId), contestProvider.fetchSolvedTeamCountByTask(taskId)
                    .done (task, solvedTeamCount) ->
                        md = new MarkdownIt()
                        hintsFormatted = []
                        _.each task.hints, (hint) ->
                            hintsFormatted.push md.render hint
                        options =
                            title: task.title
                            description: md.render task.description
                            hints: hintsFormatted
                        $submitTaskContents.html renderTemplate 'task-content-partial', options

                        $submitTaskInfo.text renderTemplate 'submit-task-status-partial', solvedTeamCount: solvedTeamCount

                        $submitTaskSubmitButton.prop 'disabled', no
                    .fail (err) ->
                        $submitTaskSubmitError.text err

            $submitTaskModal.on 'shown.bs.modal', (e) ->
                $submitTaskAnswer.focus()

            $submitTaskForm.on 'submit', (e) =>
                e.preventDefault()
                $submitTaskForm.ajaxSubmit
                    beforeSubmit: ->
                        $submitTaskSubmitError.text ''
                        $submitTaskSubmitSuccess.text ''
                        $submitTaskSubmitButton.prop 'disabled', yes
                    clearForm: yes
                    dataType: 'json'
                    xhrFields:
                        withCredentials: yes
                    headers: { 'X-CSRF-Token': identityProvider.getIdentity().token }
                    success: (responseText, textStatus, jqXHR) ->
                        $submitTaskAnswerGroup.hide()
                        $submitTaskSubmitButton.hide()
                        $submitTaskSubmitSuccess.text 'Answer is correct!'
                        hideModal = ->
                            $submitTaskModal.modal 'hide'
                        setTimeout hideModal, 1000
                    error: (jqXHR, textStatus, errorThrown) ->
                        if jqXHR.responseJSON?
                            $submitTaskSubmitError.text jqXHR.responseJSON
                        else
                            $submitTaskSubmitError.text 'Unknown error. Please try again later.'
                    complete: ->
                        $submitTaskSubmitButton.prop 'disabled', no

        renderTaskCategories: ->
            taskCategories = taskCategoryProvider.getTaskCategories()
            if taskCategories.length == 0
                @$taskCategoriesList.empty()
                @$taskCategoriesList.html $('<p></p>').addClass('lead').text 'No task categories yet.'
            else
                @$taskCategoriesList.empty()
                sortedTaskCategories = _.sortBy taskCategories, 'createdAt'
                manageable = identityProvider.getIdentity().role is 'admin' and not contestProvider.getContest().isFinished()
                for taskCategory in sortedTaskCategories
                    options =
                        id: taskCategory.id
                        title: taskCategory.title
                        description: taskCategory.description
                        updatedAt: moment(taskCategory.updatedAt).format 'lll'
                        manageable: manageable

                    @$taskCategoriesList.append $ renderTemplate 'task-category-supervisor-partial', options

        renderTaskPreviews: ->
            taskPreviews = taskProvider.getTaskPreviews()
            if taskPreviews.length == 0
                @$taskPreviewsList.empty()
                @$taskPreviewsList.html $('<p></p>').addClass('lead').text 'No tasks yet.'
            else
                identity = identityProvider.getIdentity()
                if identity.role is 'team'
                    taskProgressEntries = _.where contestProvider.getTeamTaskProgressEntries(), teamId: identity.id
                    solvedTaskIds = _.map taskProgressEntries, (taskProgress) -> taskProgress.taskId
                else
                    solvedTaskIds = []

                getSortResultByKey = (a, b, getValueFunc) ->
                    valA = getValueFunc a
                    valB = getValueFunc b
                    if a < b
                        return -1
                    else if a > b
                        return 1
                    else
                        return 0

                sortTaskPreviewsFunc = (a, b) ->
                    if a.state == b.state
                        solvedA = _.contains solvedTaskIds, a.id
                        solvedB = _.contains solvedTaskIds, b.id
                        if not solvedA and not solvedB
                            return getSortResultByKey a, b, (v) -> v.updatedAt.getTime()
                        else if solvedA and not solvedB
                            return 1
                        else if not solvedA and solvedB
                            return -1
                        else
                            return getSortResultByKey a, b, (v) -> v.updatedAt.getTime()
                    else
                        if a.isOpened()
                            return -1
                        if b.isOpened()
                            return 1
                        if a.isClosed() and b.isInitial()
                            return -1
                        if a.isInitial() and b.isClosed()
                            return 1
                        return 0

                taskCategories = taskCategoryProvider.getTaskCategories()

                @$taskPreviewsList.empty()
                taskPreviews.sort sortTaskPreviewsFunc
                contest = contestProvider.getContest()
                for taskPreview in taskPreviews
                    categoriesList = ''
                    for categoryId in taskPreview.categories
                        taskCategory = _.findWhere taskCategories, id: categoryId
                        if taskCategory?
                            categoriesList += renderTemplate 'task-category-partial', title: taskCategory.title, description: taskCategory.description

                    taskIsSolved = identity.role is 'team' and _.contains solvedTaskIds, taskPreview.id

                    options =
                        task: taskPreview
                        categoriesList: categoriesList
                        identity: identity
                        contest: contest
                        taskIsSolved: taskIsSolved

                    @$taskPreviewsList.append $ renderTemplate 'task-preview-partial', options

        present: ->
            @$main = $ '#main'
            @$main.html renderTemplate 'loading-view'

            $
                .when identityProvider.fetchIdentity(), contestProvider.fetchContest()
                .done (identity, contest) =>
                    identityProvider.subscribe()
                    @$main.html renderTemplate 'tasks-view', identity: identity

                    if dataStore.supportsRealtime()
                        dataStore.connectRealtime()

                    isAdmin = identity.role is 'admin'
                    isSupervisor = _.contains ['admin', 'manager'], identity.role
                    isTeam = identity.role is 'team'

                    navigationBar.present active: 'tasks'

                    if isTeam
                        promise = $.when taskProvider.fetchTaskPreviews(), taskCategoryProvider.fetchTaskCategories(), contestProvider.fetchTeamTaskProgressEntries(), contestProvider.fetchTeamScores()
                    else if isSupervisor
                        promise = $.when taskProvider.fetchTaskPreviews(), taskCategoryProvider.fetchTaskCategories(), contestProvider.fetchTeamTaskProgressEntries(), teamProvider.fetchTeams()
                    else
                        promise = $.when taskProvider.fetchTaskPreviews(), taskCategoryProvider.fetchTaskCategories()

                    promise
                        .done (taskPreviews, taskCategories) =>
                            @$taskCategoriesSection = $ '#themis-task-categories'
                            statusBar.present()

                            if isSupervisor
                                @$taskCategoriesSection.html renderTemplate 'task-categories-view', identity: identity, contest: contest
                                @$taskCategoriesList = $ '#themis-task-categories-list'

                                @renderTaskCategories()
                                @initReviseTaskModal()

                            if isAdmin
                                @initCreateTaskCategoryModal()
                                @initEditTaskCategoryModal()
                                @initRemoveTaskCategoryModal()

                                @initCreateTaskModal()
                                @initOpenTaskModal()
                                @initCloseTaskModal()
                                @initEditTaskModal()

                            if isTeam
                                @initSubmitTaskModal()

                            @$taskPreviewsList = $ '#themis-task-previews'
                            @renderTaskPreviews()

                            @onCreateTaskCategory = (taskCategory) =>
                                @renderTaskCategories() if isSupervisor
                                false

                            @onUpdateTaskCategory = (taskCategory) =>
                                @renderTaskCategories() if isSupervisor
                                @renderTaskPreviews()
                                false

                            @onRemoveTaskCategory = (taskCategoryId) =>
                                @renderTaskCategories() if isSupervisor
                                @renderTaskPreviews()
                                false

                            taskCategoryProvider.subscribe()
                            taskCategoryProvider.on 'createTaskCategory', @onCreateTaskCategory
                            taskCategoryProvider.on 'updateTaskCategory', @onUpdateTaskCategory
                            taskCategoryProvider.on 'removeTaskCategory', @onRemoveTaskCategory

                            taskProvider.subscribe()
                            if isSupervisor
                                @onCreateTask = (taskPreview) =>
                                    @renderTaskPreviews()
                                    false

                                taskProvider.on 'createTask', @onCreateTask

                            @onOpenTask = (taskPreview) =>
                                @renderTaskPreviews()
                                false

                            taskProvider.on 'openTask', @onOpenTask

                            @onCloseTask = (taskPreview) =>
                                @renderTaskPreviews()
                                false

                            taskProvider.on 'closeTask', @onCloseTask

                            @onUpdateTask = (taskPreview) =>
                                @renderTaskPreviews()
                                false

                            taskProvider.on 'updateTask', @onUpdateTask

                            if isTeam
                                @onCreateTeamTaskProgress = (teamTaskProgress) =>
                                    @renderTaskPreviews()
                                    false

                                contestProvider.on 'createTeamTaskProgress', @onCreateTeamTaskProgress

                            @onUpdateContest = (contest) =>
                                @renderTaskCategories()
                                @renderTaskPreviews()
                                false

                            contestProvider.on 'updateContest', @onUpdateContest

                            teamProvider.subscribe()
                        .fail (err) =>
                            @$main.html renderTemplate 'internal-error-view'
                .fail (err) =>
                    navigationBar.present()
                    @$main.html renderTemplate 'internal-error-view'

        dismiss: ->
            identityProvider.unsubscribe()

            if @onCreateTeamTaskProgress?
                contestProvider.off 'createTeamTaskProgress', @onCreateTeamTaskProgress
                @onCreateTeamTaskProgress = null

            if @onCreateTaskCategory?
                taskCategoryProvider.off 'createTaskCategory', @onCreateTaskCategory
                @onCreateTaskCategory = null
            if @onUpdateTaskCategory?
                taskCategoryProvider.off 'updateTaskCategory', @onUpdateTaskCategory
                @onUpdateTaskCategory = null
            if @onRemoveTaskCategory?
                taskCategoryProvider.off 'removeTaskCategory', @onRemoveTaskCategory
                @onRemoveTaskCategory = null
            taskCategoryProvider.unsubscribe()

            if @onCreateTask?
                taskProvider.off 'createTask', @onCreateTask
                @onCreateTask = null
            if @onOpenTask?
                taskProvider.off 'openTask', @onOpenTask
                @onOpenTask = null
            if @onCloseTask?
                taskProvider.off 'closeTask', @onCloseTask
                @onCloseTask = null
            if @onUpdateTask?
                taskProvider.off 'updateTask', @onUpdateTask
                @onUpdateTask = null
            taskProvider.unsubscribe()

            teamProvider.unsubscribe()

            if @onUpdateContest?
                contestProvider.off 'updateContest', @onUpdateContest
                @onUpdateContest = null

            @$main.empty()
            @$main = null
            @$taskCategoriesSection = null
            @$taskCategoriesList = null
            @$taskPreviewsList = null
            navigationBar.dismiss()
            statusBar.dismiss()

            if dataStore.supportsRealtime()
                dataStore.disconnectRealtime()


    new TasksView()
