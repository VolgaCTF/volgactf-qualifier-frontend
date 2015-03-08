require.config
    shim:
        'jquery.history':
            deps: ['jquery']
            exports: 'History'
        bootstrap: ['jquery']
        'bootstrap-filestyle': ['bootstrap']


define 'stateController', ['jquery', 'jquery.history', 'viewController'], ($, History, viewController) ->
    init: ->
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


define 'signupView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'jquery.form', 'bootstrap-filestyle'], ($, View, renderTemplate, dataStore, navigationBar) ->
    class SignupView extends View
        constructor: ->
            @urlRegex = /^\/signup$/

        present: ->
            dataStore.getIdentity (err, identity) ->
                $main = $ '#main'
                if err?
                    $main.html renderTemplate 'internal-error'
                    navigationBar.present()
                    return

                if identity.role == 'guest'
                    $main.html renderTemplate 'signup-view'
                    navigationBar.present()

                    $form = $main.find 'form.themis-form-signup'
                    $form.find('input:file').filestyle()
                    $form.on 'submit', (e) ->
                        e.preventDefault()
                        $form.ajaxSubmit
                            success: (responseText, textStatus, jqXHR) ->
                                console.log responseText
                            error: (jqXHR, textStatus, errorThrown) ->
                                console.log "#{textStatus}: #{errorThrown}"
                else
                    $main.html renderTemplate 'already-authenticated'
                    navigationBar.present()

        dismiss: ->
            $main = $ '#main'
            $form = $main.find 'form.themis-form-signup'
            if $form.length > 0
                $form.find('input:file').filestyle 'destroy'
                $form.off 'submit'
            $main.html ''
            navigationBar.dismiss()

    new SignupView()


define 'signinView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'jquery.form'], ($, View, renderTemplate, dataStore, navigationBar) ->
    class SigninView extends View
        constructor: ->
            @urlRegex = /^\/signin$/

        present: ->
            dataStore.getIdentity (err, identity) ->
                $main = $ '#main'
                if err?
                    $main.html renderTemplate 'internal-error'
                    navigationBar.present()
                    return

                if identity.role == 'guest'
                    $main.html renderTemplate 'signin-view'
                    navigationBar.present active: 'signin'

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
                    navigationBar.present()

        dismiss: ->
            $main = $ '#main'
            $form = $main.find 'form.themis-form-signin'
            if $form.length > 0
                $form.off 'submit'
            $main.html ''
            navigationBar.dismiss()

    new SigninView()


define 'loginView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'navigationBar', 'jquery.history', 'jquery.form'], ($, View, renderTemplate, dataStore, navigationBar, History) ->
    class LoginView extends View
        constructor: ->
            @urlRegex = /^\/login$/

        present: ->
            dataStore.getIdentity (err, identity) ->
                $main = $ '#main'
                if err?
                    $main.html renderTemplate 'internal-error'
                    navigationBar.present()
                    return

                if identity.role == 'guest'
                    $main.html renderTemplate 'login-view'
                    navigationBar.present()

                    $form = $main.find 'form.themis-form-login'
                    $form.on 'submit', (e) ->
                        e.preventDefault()
                        $form.ajaxSubmit
                            dataType: 'json'
                            xhrFields:
                                withCredentials: yes
                            success: (responseText, textStatus, jqXHR) ->
                                History.pushState urlPath: '/', '', '/'
                            error: (jqXHR, textStatus, errorThrown) ->
                                console.log "#{textStatus}: #{errorThrown}"
                else
                    $main.html renderTemplate 'already-authenticated'
                    navigationBar.present()

        dismiss: ->
            $main = $ '#main'
            $form = $main.find 'form.themis-form-login'
            if $form.length > 0
                $form.off 'submit'
            $main.html ''
            navigationBar.dismiss()

    new LoginView()


define 'indexView', ['jquery', 'view', 'renderTemplate', 'dataStore', 'navigationBar'], ($, View, renderTemplate, dataStore, navigationBar) ->
    class IndexView extends View
        constructor: ->
            @urlRegex = /^\/$/

        present: ->
            dataStore.getIdentity (err, identity) ->
                $main = $ '#main'
                if err?
                    $main.html renderTemplate 'internal-error'
                    navigationBar.present()
                else
                    $('#main').html renderTemplate 'index-view', identity: identity
                    navigationBar.present
                        show:
                            news: yes
                            about: yes
                            signin: identity.role == 'guest'
                            signout: identity.role != 'guest'

        dismiss: ->
            $('#main').html ''
            navigationBar.dismiss()

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


define 'navigationBar', ['jquery', 'underscore', 'renderTemplate', 'metadataStore', 'jquery.history'], ($, _, renderTemplate, metadataStore, History) ->
    present: (options = {}) ->
        defaultOptions =
            show:
                news: yes
                about: yes
                signin: yes
                signout: no
            urlPath: window.location.pathname
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
                        window.location.reload()
                    error: (jqXHR, textStatus, errorThrown) ->
                        console.log errorThrown


    dismiss: ->
        $navbar = $ '#themis-navbar'
        $signout = $navbar.find 'a[data-action="signout"]'
        $signout.off 'click'
        $navbar.html ''


define 'themis', ['jquery', 'stateController', 'bootstrap'], ($, stateController) ->
    $(document).ready ->
        stateController.init()
