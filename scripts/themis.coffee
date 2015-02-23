require.config
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
            url = "#{metadataStore.getMetadata('domain-api')}/identity"
            $.ajax
                url: url
                dataType: 'json'
                xhrFields:
                    withCredentials: yes
                success: (responseText, textStatus, jqXHR) ->
                    callback null, responseText
                error: (jqXHR, textStatus, errorThrown) ->
                    callback errorThrown, null

    new DataStore()


define 'metadataStore', ['jquery'], ($) ->
    class MetadataStore
        constructor: ->
            @metadata = {}

        getMetadata: (name) ->
            unless @metadata[name]?
                $el = $ "script[type=\"text/x-metadata\"][data-name=\"#{name}\"]"
                if $el.length > 0
                    @metadata[name] = $el.data 'value'
                else
                    @metadata[name] = null

            @metadata[name]

    new MetadataStore()


define 'renderTemplate', ['jquery', 'underscore'], ($, _) ->
    store = null
    templates = {}

    (name, params = {}) ->
        unless templates[name]?
            unless store?
                store = $ '.themis-partials'

            $el = store.find "script[type=\"text/x-template\"][data-name=\"#{name}\"]"
            if $el.length > 0
                templates[name] = _.template $el.html()
            else
                templates[name] = _.template ''

        templates[name] params


define 'view', [], ->
    class View
        constructor: (urlRegex = null) ->
            @urlRegex = urlRegex
            @present = ->
            @dismiss = ->

        on: (name, callback) ->
            if name == 'present'
                @present = callback
            else if name == 'dismiss'
                @dismiss = callback
            this

    View


define 'signupView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'jquery.form'], ($, View, renderTemplate, dataStore) ->
    class SignupView extends View
        constructor: ->
            @urlRegex = /^\/signup$/

        present: ->
            dataStore.getIdentity (err, identity) ->
                $main = $ '#main'
                if err?
                    $main.html renderTemplate 'internal-error'
                    return

                if identity.role == 'guest'
                    $main.html renderTemplate 'signup-view'
                    $form = $main.find 'form.themis-form-signup'
                    $form.on 'submit', (e) ->
                        e.preventDefault()
                        $form.ajaxSubmit
                            success: (responseText, textStatus, jqXHR) ->
                                console.log responseText
                            error: (jqXHR, textStatus, errorThrown) ->
                                console.log "#{textStatus}: #{errorThrown}"
                else
                    $main.html renderTemplate 'already-authenticated'

        dismiss: ->
            $main = $ '#main'
            $form = $main.find 'form.themis-form-signup'
            if $form.length > 0
                $form.off 'submit'
            $main.html ''

    new SignupView()


define 'signinView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'jquery.form'], ($, View, renderTemplate, dataStore) ->
    class SigninView extends View
        constructor: ->
            @urlRegex = /^\/signin$/

        present: ->
            dataStore.getIdentity (err, identity) ->
                $main = $ '#main'
                if err?
                    $main.html renderTemplate 'internal-error'
                    return

                if identity.role == 'guest'
                    $main.html renderTemplate 'signin-view'

                    $form = $main.find 'form.themis-form-signin'
                    $form.on 'submit', (e) ->
                        e.preventDefault()
                        $form.ajaxSubmit
                            success: (responseText, textStatus, jqXHR) ->
                                console.log responseText
                            error: (jqXHR, textStatus, errorThrown) ->
                                console.log "#{textStatus}: #{errorThrown}"
                else
                    $main.html renderTemplate 'already-authenticated'

        dismiss: ->
            $main = $ '#main'
            $form = $main.find 'form.themis-form-signin'
            if $form.length > 0
                $form.off 'submit'
            $main.html ''

    new SigninView()


define 'loginView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'jquery.form'], ($, View, renderTemplate, dataStore) ->
    class LoginView extends View
        constructor: ->
            @urlRegex = /^\/login$/

        present: ->
            dataStore.getIdentity (err, identity) ->
                $main = $ '#main'
                if err?
                    $main.html renderTemplate 'internal-error'
                    return

                if identity.role == 'guest'
                    $main.html renderTemplate 'login-view'

                    $form = $main.find 'form.themis-form-login'
                    $form.on 'submit', (e) ->
                        e.preventDefault()
                        $form.ajaxSubmit
                            dataType: 'json'
                            xhrFields:
                                withCredentials: yes
                            success: (responseText, textStatus, jqXHR) ->
                                console.log responseText
                            error: (jqXHR, textStatus, errorThrown) ->
                                console.log "#{textStatus}: #{errorThrown}"
                else
                    $main.html renderTemplate 'already-authenticated'

        dismiss: ->
            $main = $ '#main'
            $form = $main.find 'form.themis-form-login'
            if $form.length > 0
                $form.off 'submit'
            $main.html ''

    new LoginView()


define 'indexView', ['jquery', 'view', 'renderTemplate', 'dataStore'], ($, View, renderTemplate, dataStore) ->
    class IndexView extends View
        constructor: ->
            @urlRegex = /^\/$/

        present: ->
            dataStore.getIdentity (err, identity) ->
                $main = $ '#main'
                if err?
                    $main.html renderTemplate 'internal-error'
                else
                    $('#main').html renderTemplate 'index-view', identity: identity

        dismiss: ->
            $('#main').html ''

    new IndexView()


define 'viewControllerBase', ['underscore', 'view'], (_, View) ->
    class ViewControllerBase
        constructor: ->
            @views = []
            @activeView = null
            @errorViews = {}

        view: (param) ->
            if $.type(param) is 'regexp'
                view = new View param
            else
                view = param
            @views.push view
            view

        errorView: (name) ->
            view  = new View()
            @errorViews[name] = view
            view

        findView: (urlPath) ->
            found = _.find @views, (view) ->
                view.urlRegex.test urlPath

            found ? @errorViews['not-found']

        render: (urlPath) ->
            newView = @findView urlPath
            @activeView?.dismiss()
            @activeView = newView
            @activeView.present()


define 'viewController', ['viewControllerBase', 'renderTemplate', 'indexView', 'signinView', 'signupView', 'loginView'], (ViewControllerBase, renderTemplate, indexView, signinView, signupView, loginView) ->
    viewController = new ViewControllerBase()

    viewController.view indexView
    viewController.view signinView
    viewController.view signupView
    viewController.view loginView

    viewController.errorView('not-found')
        .on 'present', ->
            $('#main').html renderTemplate 'not-found-view', urlPath: window.location.pathname
        .on 'dismiss', ->
            $('#main').html ''


    viewController


define 'runStateController', ['jquery', 'jquery.history', 'viewController'], ($, History, viewController) ->
    ->
        History.Adapter.bind window, 'statechange', ->
            data = History.getState().data
            unless data.urlPath?
                data.urlPath = window.location.pathname
            viewController.render data.urlPath

        $(document).on 'click', 'a[data-push-history]', (e) ->
            e.preventDefault()
            e.stopPropagation()
            urlPath = $(e.target).attr 'href'

            History.pushState urlPath: urlPath, '', urlPath

        History.Adapter.trigger window, 'statechange'


define 'themis', ['jquery', 'runStateController', 'bootstrap', 'bootstrap-filestyle'], ($, runStateController) ->
    $(document).ready ->
        runStateController()
