require.config
    paths:
        jquery: [
            'http://code.jquery.com/jquery-2.1.3.min',
            'jquery'
        ],
        bootstrap: [
            'http://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/js/bootstrap.min',
            'bootstrap'
        ],
        underscore: [
            'http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min',
            'underscore'
        ],
        'jquery.history': [
            'http://cdnjs.cloudflare.com/ajax/libs/history.js/1.8/bundled/html5/jquery.history.min',
            'jquery.history'
        ],
        'jquery.form': [
            'http://cdnjs.cloudflare.com/ajax/libs/jquery.form/3.46/jquery.form.min',
            'jquery.form'
        ],
        parsley: [
            'http://cdnjs.cloudflare.com/ajax/libs/parsley.js/2.0.7/parsley.min',
            'parsley'
        ],
        'markdown-it': [
            'http://cdnjs.cloudflare.com/ajax/libs/markdown-it/4.1.0/markdown-it.min',
            'markdown-it'
        ],
        'moment': [
            'http://cdnjs.cloudflare.com/ajax/libs/moment.js/2.9.0/moment.min',
            'moment'
        ],
        'bootstrap-datetimepicker': [
            'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datetimepicker/4.7.14/js/bootstrap-datetimepicker.min',
            'bootstrap-datetimepicker'
        ]
    shim:
        'jquery.history':
            deps: ['jquery']
            exports: 'History'
        bootstrap: ['jquery']
        'bootstrap-filestyle': ['bootstrap']


define 'contestState', [], ->
    class ContestState
        constructor: (options) ->
            @state = options.state
            @startsAt = if options.startsAt? then new Date(options.startsAt) else null
            @finishesAt = if options.finishesAt? then new Date(options.finishesAt) else null

        isInitial: ->
            @state is 1

        isStarted: ->
            @state is 2

        isPaused: ->
            @state is 3

        isFinished: ->
            @state is 4


define 'taskCategoryModel', [], ->
    class TaskCategoryModel
        constructor: (options) ->
            @id = options.id
            @title = options.title
            @description = options.description
            @createdAt = new Date options.createdAt
            @updatedAt = new Date options.updatedAt


define 'teamScoreModel', [], ->
    class TeamScoreModel
        constructor: (options) ->
            @team = options.team
            @score = options.score
            @updatedAt = if options.updatedAt? then new Date(options.updatedAt) else null


define 'teamModel', [], ->
    class TeamModel
        constructor: (options) ->
            @id = options.id
            @name = options.name
            @country = options.country
            @locality = options.locality
            @institution = options.institution
            @createdAt = new Date options.createdAt
            @email = if options.email? then options.email else null
            @emailConfirmed = if options.emailConfirmed? then options.emailConfirmed else no


define 'taskPreviewModel', [], ->
    class TaskPreviewModel
        constructor: (options) ->
            @id = options.id
            @title = options.title
            @value = options.value
            @createdAt = new Date options.createdAt
            @updatedAt = new Date options.updatedAt
            @categories = options.categories
            @state = options.state


define 'taskModel', ['taskPreviewModel'], (TaskPreviewModel) ->
    class TaskModel extends TaskPreviewModel
        constructor: (options) ->
            super options
            @description = options.description
            @hints = options.hints


define 'dataStore', ['jquery', 'underscore', 'metadataStore', 'contestState', 'taskCategoryModel', 'teamScoreModel', 'teamModel', 'taskPreviewModel', 'taskModel'], ($, _, metadataStore, ContestState, TaskCategoryModel, TeamScoreModel, TeamModel, TaskPreviewModel, TaskModel) ->
    class DataStore
        constructor: ->
            @eventSource = null

        getIdentity: ->
            promise = $.Deferred()

            url = "#{metadataStore.getMetadata 'domain-api' }/identity"
            $.ajax
                url: url
                dataType: 'json'
                xhrFields:
                    withCredentials: yes
                success: (responseJSON, textStatus, jqXHR) ->
                    promise.resolve responseJSON
                error: (jqXHR, textStatus, errorThrown) ->
                    if jqXHR.responseJSON?
                        promise.reject jqXHR.responseJSON
                    else
                        promise.reject 'Unknown error. Please try again later.'

            promise

        verifyEmail: (data, token, callback) ->
            url = "#{metadataStore.getMetadata 'domain-api' }/team/verify-email"
            $.ajax
                url: url
                type: 'POST'
                dataType: 'json'
                data: data
                xhrFields:
                    withCredentials: yes
                headers: { 'X-CSRF-Token': token }
                success: (responseJSON, textStatus, jqXHR) ->
                    callback null, responseJSON
                error: (jqXHR, textStatus, errorThrown) ->
                    if jqXHR.responseJSON?
                        callback jqXHR.responseJSON, null
                    else
                        callback 'Unknown error. Please try again later.', null

        getTeamProfile: (id, callback) ->
            url = "#{metadataStore.getMetadata 'domain-api' }/team/#{id}/profile"
            $.ajax
                url: url
                dataType: 'json'
                xhrFields:
                    withCredentials: yes
                success: (responseJSON, textStatus, jqXHR) ->
                    callback null, new TeamModel responseJSON
                error: (jqXHR, textStatus, errorThrown) ->
                    if jqXHR.responseJSON?
                        callback jqXHR.responseJSON, null
                    else
                        callback 'Unknown error. Please try again later.', null

        getTeams: (callback) ->
            promise = $.Deferred()

            url = "#{metadataStore.getMetadata 'domain-api' }/team/all"
            $.ajax
                url: url
                dataType: 'json'
                xhrFields:
                    withCredentials: yes
                success: (responseJSON, textStatus, jqXHR) ->
                    createTeam = (options) ->
                        new TeamModel options

                    promise.resolve _.map responseJSON, createTeam
                error: (jqXHR, textStatus, errorThrown) ->
                    if jqXHR.responseJSON?
                        promise.reject jqXHR.responseJSON
                    else
                        promise.reject 'Unknown error. Please try again later.'

            promise

        getPosts: (callback) ->
            url = "#{metadataStore.getMetadata 'domain-api' }/post/all"
            $.ajax
                url: url
                dataType: 'json'
                xhrFields:
                    withCredentials: yes
                success: (responseJSON, textStatus, jqXHR) ->
                    result = []
                    for post in responseJSON
                        result.push
                            id: post.id
                            title: post.title
                            description: post.description
                            createdAt: new Date post.createdAt
                            updatedAt: new Date post.updatedAt

                    callback null, result
                error: (jqXHR, textStatus, errorThrown) ->
                    if jqXHR.responseJSON?
                        callback jqXHR.responseJSON, null
                    else
                        callback 'Unknown error. Please try again later.', null

        removePost: (id, token, callback) ->
            url = "#{metadataStore.getMetadata 'domain-api' }/post/#{id}/remove"
            $.ajax
                url: url
                type: 'POST'
                dataType: 'json'
                data: {}
                xhrFields:
                    withCredentials: yes
                headers: { 'X-CSRF-Token': token }
                success: (responseJSON, textStatus, jqXHR) ->
                    callback null
                error: (jqXHR, textStatus, errorThrown) ->
                    if jqXHR.responseJSON?
                        callback jqXHR.responseJSON
                    else
                        callback 'Unknown error. Please try again later.'

        getContest: ->
            promise = $.Deferred()

            url = "#{metadataStore.getMetadata 'domain-api' }/contest"
            $.ajax
                url: url
                dataType: 'json'
                xhrFields:
                    withCredentials: yes
                success: (responseJSON, textStatus, jqXHR) ->
                    promise.resolve new ContestState responseJSON
                error: (jqXHR, textStatus, errorThrown) ->
                    if jqXHR.responseJSON?
                        promise.reject jqXHR.responseJSON
                    else
                        promise.reject 'Unknown error. Please try again later.'

            promise

        getTaskCategories: ->
            promise = $.Deferred()

            url = "#{metadataStore.getMetadata 'domain-api' }/task/category/all"
            $.ajax
                url: url
                dataType: 'json'
                xhrFields:
                    withCredentials: yes
                success: (responseJSON, textStatus, jqXHR) ->
                    createCategory = (options) ->
                        new TaskCategoryModel options

                    promise.resolve _.map responseJSON, createCategory
                error: (jqXHR, textStatus, errorThrown) ->
                    if jqXHR.responseJSON?
                        promise.reject jqXHR.responseJSON
                    else
                        promise.reject 'Unknown error. Please try again later.'

            promise

        removeTaskCategory: (id, token, callback) ->
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

        getTeamScores: ->
            promise = $.Deferred()

            url = "#{metadataStore.getMetadata 'domain-api' }/contest/scores"
            $.ajax
                url: url
                dataType: 'json'
                xhrFields:
                    withCredentials: yes
                success: (responseJSON, textStatus, jqXHR) ->
                    createScore = (options) ->
                        new TeamScoreModel options
                    promise.resolve _.map responseJSON, createScore
                error: (jqXHR, textStatus, errorThrown) ->
                    if jqXHR.responseJSON?
                        promise.reject jqXHR.responseJSON
                    else
                        promise.reject 'Unknown error. Please try again later.'

            promise

        getTaskPreviews: ->
            promise = $.Deferred()

            url = "#{metadataStore.getMetadata 'domain-api' }/task/all"
            $.ajax
                url: url
                dataType: 'json'
                xhrFields:
                    withCredentials: yes
                success: (responseJSON, textStatus, jqXHR) ->
                    createPreview = (options) ->
                        new TaskPreviewModel options

                    promise.resolve _.map responseJSON, createPreview
                error: (jqXHR, textStatus, errorThrown) ->
                    if jqXHR.responseJSON?
                        promise.reject jqXHR.responseJSON
                    else
                        promise.reject 'Unknown error. Please try again later.'

            promise

        getTask: (taskId) ->
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

        supportsRealtime: ->
            window.EventSource?

        connectRealtime: ->
            @eventSource = new window.EventSource "#{metadataStore.getMetadata 'domain-api' }/events", withCredentials: yes

        disconnectRealtime: ->
            if @eventSource?
                @eventSource.close()
                @eventSource = null

        getRealtimeProvider: ->
            @eventSource

    new DataStore()

#= include utils/metadata-store.coffee
#= include utils/render-template.coffee

#= include views/base.coffee
#= include views/signup.coffee
#= include views/signin.coffee
#= include views/login.coffee
#= include views/index.coffee
#= include views/profile.coffee
#= include views/verify-email.coffee
#= include views/news.coffee
#= include views/about.coffee
#= include views/teams.coffee
#= include views/tasks.coffee
#= include views/scoreboard.coffee
#= include views/logs.coffee
#= include views/not-found.coffee

#= include controllers/state.coffee
#= include controllers/view-base.coffee
#= include controllers/view.coffee


define 'statusBar', ['jquery', 'underscore', 'renderTemplate', 'dataStore', 'contestState', 'moment', 'bootstrap', 'parsley', 'bootstrap-datetimepicker'], ($, _, renderTemplate, dataStore, ContestState, moment) ->
    class StatusBar
        constructor: ->
            @$container = null
            @$stateContainer = null
            @identity = null
            @contest = null

            @onUpdateContest = null

        initUpdateContestModal: ->
            $updateContestModal = $ '#update-contest-modal'
            $updateContestModal.modal
                show: no

            $updateContestSubmitError = $updateContestModal.find '.submit-error > p'
            $updateContestSubmitButton = $updateContestModal.find 'button[data-action="complete-update-contest"]'
            $updateContestForm = $updateContestModal.find 'form'
            $updateContestForm.parsley()

            $updateContestState = $ '#update-contest-state'
            $updateContestStartsAt = $ '#update-contest-starts'
            $updateContestFinishesAt = $ '#update-contest-finishes'

            pickerFormat = 'D MMM YYYY [at] HH:mm'

            $updateContestStartsAt.datetimepicker
                showClose: yes
                sideBySide: yes
                format: pickerFormat
            $updateContestFinishesAt.datetimepicker
                showClose: yes
                sideBySide: yes
                format: pickerFormat

            $updateContestSubmitButton.on 'click', (e) ->
                $updateContestForm.trigger 'submit'

            $updateContestModal.on 'show.bs.modal', (e) =>
                $updateContestState.val @contest.state
                $updateContestStartsAt.data('DateTimePicker').date @contest.startsAt
                $updateContestFinishesAt.data('DateTimePicker').date @contest.finishesAt
                $updateContestSubmitError.text ''

            $updateContestModal.on 'shown.bs.modal', (e) ->
                $updateContestState.focus()

            $updateContestForm.on 'submit', (e) =>
                valStartsAt = $updateContestStartsAt.data('DateTimePicker').date()
                valFinishesAt = $updateContestFinishesAt.data('DateTimePicker').date()

                e.preventDefault()
                $updateContestForm.ajaxSubmit
                    beforeSubmit: ->
                        $updateContestSubmitError.text ''
                        $updateContestSubmitButton.prop 'disabled', yes
                    clearForm: yes
                    data:
                        startsAt: if valStartsAt then valStartsAt.valueOf() else null
                        finishesAt: if valFinishesAt then valFinishesAt.valueOf() else null
                    dataType: 'json'
                    xhrFields:
                        withCredentials: yes
                    headers: { 'X-CSRF-Token': @identity.token }
                    success: (responseJSON, textStatus, jqXHR) ->
                        $updateContestModal.modal 'hide'
                    error: (jqXHR, textStatus, errorThrown) ->
                        if jqXHR.responseJSON?
                            $updateContestSubmitError.text jqXHR.responseJSON
                        else
                            $updateContestSubmitError.text 'Unknown error. Please try again later.'
                    complete: ->
                        $updateContestSubmitButton.prop 'disabled', no

        renderContestState: ->
            contestObj =
                state: @contest.state
                startsAt: moment(@contest.startsAt).format 'lll'
            @$stateContainer.html renderTemplate 'contest-state-partial', contest: contestObj, identity: @identity

        present: (options = {}) ->
            defaultOptions =
                identity: null
                contest: null
            options = _.extend defaultOptions, options
            @identity = options.identity
            @contest = options.contest

            @$container = $ '#themis-statusbar'
            @$container.html renderTemplate 'statusbar-view'
            @$stateContainer = $ '#themis-contest-state'
            @renderContestState()

            if @identity.role == 'admin'
                @initUpdateContestModal()

            if dataStore.supportsRealtime()
                @onUpdateContest = (e) =>
                    data = JSON.parse e.data
                    @contest = new ContestState data
                    @renderContestState()

                dataStore.getRealtimeProvider().addEventListener 'updateContest', @onUpdateContest

        dismiss: ->
            if dataStore.supportsRealtime()
                if @onUpdateContest?
                    dataStore.getRealtimeProvider().removeEventListener 'updateContest', @onUpdateContest
                    @onUpdateContest = null

            if @$container?.length
                @$container.empty()
                @$container = null
            @$stateContainer = null
            @identity = null
            @contest = null

    new StatusBar()


define 'navigationBar', ['jquery', 'underscore', 'renderTemplate', 'metadataStore', 'stateController', 'dataStore'], ($, _, renderTemplate, metadataStore, stateController, dataStore) ->
    class NavigationBar
        present: (options = {}) ->
            defaultOptions =
                urlPath: window.location.pathname
                identity: null
                active: null
            options = _.extend defaultOptions, options

            $navbar = $ '#themis-navbar'
            $navbar.html renderTemplate 'navbar-view', options

            $signout = $navbar.find 'a[data-action="signout"]'
            if $signout.length > 0
                $signout.on 'click', (e) ->
                    e.preventDefault()
                    e.stopPropagation()

                    url = "#{metadataStore.getMetadata('domain-api')}/signout"
                    $.ajax
                        method: 'POST'
                        url: url
                        dataType: 'json'
                        xhrFields:
                            withCredentials: yes
                        headers: { 'X-CSRF-Token': options.identity.token }
                        success: (responseText, textStatus, jqXHR) ->
                            stateController.navigateTo '/'
                        error: (jqXHR, textStatus, errorThrown) ->
                            console.log errorThrown

        dismiss: ->
            $('#themis-navbar').empty()

    new NavigationBar()


define 'themis', ['jquery', 'stateController', 'viewController', 'bootstrap'], ($, stateController, viewController) ->
    $(document).ready ->
        stateController.init viewController
