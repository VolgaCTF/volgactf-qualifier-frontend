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
        ]
    shim:
        'jquery.history':
            deps: ['jquery']
            exports: 'History'
        bootstrap: ['jquery']
        'bootstrap-filestyle': ['bootstrap']


define 'dataStore', ['jquery', 'metadataStore'], ($, metadataStore) ->
    class DataStore
        constructor: ->

        getIdentity: (callback) ->
            url = "#{metadataStore.getMetadata 'domain-api' }/identity"
            $.ajax
                url: url
                dataType: 'json'
                xhrFields:
                    withCredentials: yes
                success: (responseText, textStatus, jqXHR) ->
                    callback null, responseText
                error: (jqXHR, textStatus, errorThrown) ->
                    callback errorThrown, null

        verifyEmail: (data, callback) ->
            url = "#{metadataStore.getMetadata 'domain-api' }/team/verify-email"
            $.ajax
                url: url
                type: 'POST'
                dataType: 'json'
                data: data
                xhrFields:
                    withCredentials: yes
                success: (responseJSON, textStatus, jqXHR) ->
                    callback null, responseJSON
                error: (jqXHR, textStatus, errorThrown) ->
                    if jqXHR.responseJSON?
                        callback jqXHR.responseJSON, null
                    else
                        callback 'Unknown error. Please try again later.', null

        getTeamProfile: (id, callback) ->
            url = "#{metadataStore.getMetadata 'domain-api' }/team/profile/#{id}"
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
#= include views/not-found.coffee

#= include controllers/state.coffee
#= include controllers/view-base.coffee
#= include controllers/view.coffee

define 'navigationBar', ['jquery', 'underscore', 'renderTemplate', 'metadataStore', 'stateController'], ($, _, renderTemplate, metadataStore, stateController) ->
    class NavigationBar
        present: (options = {}) ->
            defaultOptions =
                show:
                    news: yes
                    about: yes
                urlPath: window.location.pathname
                identity: null
                active: null
            options = _.extend defaultOptions, options

            $navbar = $ '#themis-navbar'
            $navbar.html renderTemplate 'navbar', options

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
