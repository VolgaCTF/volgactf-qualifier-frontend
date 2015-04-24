require.config
    paths:
        jquery: [
            'http://code.jquery.com/jquery-2.1.3.min'
            'jquery'
        ],
        bootstrap: [
            'http://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/js/bootstrap.min'
            'bootstrap'
        ],
        underscore: [
            'http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min'
            'underscore'
        ],
        'jquery.history': [
            'http://cdnjs.cloudflare.com/ajax/libs/history.js/1.8/bundled/html5/jquery.history.min'
            'jquery.history'
        ],
        'jquery.form': [
            'http://cdnjs.cloudflare.com/ajax/libs/jquery.form/3.46/jquery.form.min'
            'jquery.form'
        ],
        parsley: [
            'http://cdnjs.cloudflare.com/ajax/libs/parsley.js/2.0.7/parsley.min'
            'parsley'
        ],
        'markdown-it': [
            'http://cdnjs.cloudflare.com/ajax/libs/markdown-it/4.1.0/markdown-it.min'
            'markdown-it'
        ],
        'moment': [
            'http://cdnjs.cloudflare.com/ajax/libs/moment.js/2.9.0/moment.min'
            'moment'
        ],
        'bootstrap-datetimepicker': [
            'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datetimepicker/4.7.14/js/bootstrap-datetimepicker.min'
            'bootstrap-datetimepicker'
        ],
        'EventEmitter': [
            'http://cdnjs.cloudflare.com/ajax/libs/EventEmitter/4.2.11/EventEmitter.min'
            'EventEmitter'
        ]
    shim:
        'jquery.history':
            deps: ['jquery']
            exports: 'History'
        bootstrap: ['jquery']
        'bootstrap-filestyle': ['bootstrap']


#= include models/contest.coffee
#= include models/task-category.coffee
#= include models/team-score.coffee
#= include models/team.coffee
#= include models/task-preview.coffee
#= include models/task.coffee
#= include models/post.coffee


define 'dataStore', ['jquery', 'underscore', 'metadataStore', 'teamModel'], ($, _, metadataStore, TeamModel) ->
    class DataStore
        constructor: ->
            @eventSource = null

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

#= include providers/identity.coffee
#= include providers/post.coffee
#= include providers/task-category.coffee
#= include providers/task.coffee
#= include providers/contest.coffee
#= include providers/team.coffee

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


define 'statusBar', ['jquery', 'underscore', 'renderTemplate', 'dataStore', 'moment', 'contestProvider', 'identityProvider', 'bootstrap', 'parsley', 'bootstrap-datetimepicker'], ($, _, renderTemplate, dataStore, moment, contestProvider, identityProvider) ->
    class StatusBar
        constructor: ->
            @$container = null
            @$stateContainer = null

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

            $updateContestModal.on 'show.bs.modal', (e) ->
                contest = contestProvider.getContest()
                $updateContestState.val contest.state
                $updateContestStartsAt.data('DateTimePicker').date contest.startsAt
                $updateContestFinishesAt.data('DateTimePicker').date contest.finishesAt
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
                    headers: { 'X-CSRF-Token': identityProvider.getIdentity().token }
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
            contest = contestProvider.getContest()
            contestObj =
                state: contest.state
                startsAt: moment(contest.startsAt).format 'lll'
            @$stateContainer.html renderTemplate 'contest-state-partial', contest: contestObj, identity: identityProvider.getIdentity()

        present: ->
            @$container = $ '#themis-statusbar'
            @$container.html renderTemplate 'statusbar-view'
            @$stateContainer = $ '#themis-contest-state'
            @renderContestState()

            if identityProvider.getIdentity().role == 'admin'
                @initUpdateContestModal()

            @onUpdateContest = (e) =>
                @renderContestState()
                false

            contestProvider.subscribe()
            contestProvider.on 'updateContest', @onUpdateContest

        dismiss: ->
            if @onUpdateContest?
                contestProvider.off 'updateContest', @onUpdateContest
                @onUpdateContest = null
            contestProvider.unsubscribe()

            if @$container?.length
                @$container.empty()
                @$container = null
            @$stateContainer = null


    new StatusBar()


define 'navigationBar', ['jquery', 'underscore', 'renderTemplate', 'metadataStore', 'stateController', 'dataStore', 'identityProvider'], ($, _, renderTemplate, metadataStore, stateController, dataStore, identityProvider) ->
    class NavigationBar
        present: (options = {}) ->
            defaultOptions =
                urlPath: window.location.pathname
                active: null
                identity: identityProvider.getIdentity()
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
                        headers: { 'X-CSRF-Token': identityProvider.getIdentity().token }
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
