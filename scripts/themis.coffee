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
        ]
    shim:
        'jquery.history':
            deps: ['jquery']
            exports: 'History'
        bootstrap: ['jquery']
        'bootstrap-filestyle': ['bootstrap']


define 'dataStore', ['jquery', 'underscore', 'metadataStore'], ($, _, metadataStore) ->
    class DataStore
        constructor: ->
            @eventSource = null

        getIdentity: (callback) ->
            url = "#{metadataStore.getMetadata 'domain-api' }/identity"
            $.ajax
                url: url
                dataType: 'json'
                xhrFields:
                    withCredentials: yes
                success: (responseJSON, textStatus, jqXHR) ->
                    callback null, responseJSON
                error: (jqXHR, textStatus, errorThrown) ->
                    if jqXHR.responseJSON?
                        callback jqXHR.responseJSON, null
                    else
                        callback 'Unknown error. Please try again later.', null

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

        createTeam: (options) ->
            result =
                id: options.id
                name: options.name
                country: options.country
                locality: options.locality
                institution: options.institution
                createdAt: new Date options.createdAt
                email: options.email
                emailConfirmed: options.emailConfirmed

        getTeamProfile: (id, callback) ->
            url = "#{metadataStore.getMetadata 'domain-api' }/team/#{id}/profile"
            $.ajax
                url: url
                dataType: 'json'
                xhrFields:
                    withCredentials: yes
                success: (responseJSON, textStatus, jqXHR) =>
                    callback null, @createTeam responseJSON
                error: (jqXHR, textStatus, errorThrown) ->
                    if jqXHR.responseJSON?
                        callback jqXHR.responseJSON, null
                    else
                        callback 'Unknown error. Please try again later.', null

        getTeams: (callback) ->
            url = "#{metadataStore.getMetadata 'domain-api' }/team/all"
            $.ajax
                url: url
                dataType: 'json'
                xhrFields:
                    withCredentials: yes
                success: (responseJSON, textStatus, jqXHR) ->
                    callback null, _.map responseJSON, @createTeam
                error: (jqXHR, textStatus, errorThrown) ->
                    if jqXHR.responseJSON?
                        callback jqXHR.responseJSON, null
                    else
                        callback 'Unknown error. Please try again later.', null

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
#= include views/control.coffee
#= include views/logs.coffee
#= include views/not-found.coffee

#= include controllers/state.coffee
#= include controllers/view-base.coffee
#= include controllers/view.coffee

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
