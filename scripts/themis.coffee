require.config
    shim:
        'jquery.history':
            deps: ['jquery']
            exports: 'History'
        bootstrap: ['jquery']
        'bootstrap-filestyle': ['bootstrap']


# define 'dataStore', ['jquery', 'EventEmitter', 'metadataStore'], ($, EventEmitter, metadataStore) ->
#     class DataStore extends EventEmitter
#         constructor: ->
#             super()
#             console.log 'DataStore created!'


#         getIdentity: (callback) ->
#             url = "#{metadataStore.getMetadata('domain-api')}/identity"
#             $.ajax
#                 url: url
#                 dataType: 'json'
#                 success: (responseText, textStatus, jqXHR) ->
#                     callback null, responseText
#                 error: (jqXHR, textStatus, errorThrown) ->
#                     callback errorThrown, null

#     new DataStore()


# define 'metadataStore', ['jquery'], ($) ->
#     class MetadataStore
#         constructor: ->
#             @metadata = {}

#         getMetadata: (name) ->
#             unless @metadata[name]?
#                 $el = $ "script[type=\"text/x-metadata\"][data-name=\"#{name}\"]"
#                 if $el.length > 0
#                     @metadata[name] = $el.data 'value'
#                 else
#                     @metadata[name] = null

#             @metadata[name]

#     new MetadataStore()


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


define 'signupView', ['jquery', 'view', 'renderTemplate', 'jquery.form'], ($, View, renderTemplate) ->
    class SignupView extends View
        constructor: ->
            @urlRegex = /^\/signup$/

        present: ->
            console.log 'Signup view present'
            $main = $ '#main'
            $main.html renderTemplate 'signup-view'
            $form = $main.find 'form.themis-form-signup'
            $form.on 'submit', (e) ->
                e.preventDefault()
                $form.ajaxSubmit
                    success: (responseText, textStatus, jqXHR) ->
                        console.log responseText
                    error: (jqXHR, textStatus, errorThrown) ->
                        console.log "#{textStatus}: #{errorThrown}"


        dismiss: ->
            console.log 'Signup view dismiss'
            $main = $ '#main'
            $form = $main.find 'form.themis-form-signup'
            $form.off 'submit'
            $main.html ''

    new SignupView()


define 'signinView', ['jquery', 'view', 'renderTemplate', 'jquery.form'], ($, View, renderTemplate) ->
    class SigninView extends View
        constructor: ->
            @urlRegex = /^\/signin$/

        present: ->
            console.log 'Signin view present'
            $main = $ '#main'
            $main.html renderTemplate 'signin-view'

            $form = $main.find 'form.themis-form-signin'
            $form.on 'submit', (e) ->
                e.preventDefault()
                $form.ajaxSubmit
                    success: (responseText, textStatus, jqXHR) ->
                        console.log responseText
                    error: (jqXHR, textStatus, errorThrown) ->
                        console.log "#{textStatus}: #{errorThrown}"

        dismiss: ->
            console.log 'Signin view dismiss'
            $main = $ '#main'
            $form = $main.find 'form.themis-form-signin'
            $form.off 'submit'
            $main.html ''

    new SigninView()


define 'loginView', ['jquery', 'view', 'renderTemplate', 'jquery.form'], ($, View, renderTemplate) ->
    class LoginView extends View
        constructor: ->
            @urlRegex = /^\/login$/

        present: ->
            console.log 'Login view present'
            $main = $ '#main'
            $main.html renderTemplate 'login-view'

            $form = $main.find 'form.themis-form-login'
            $form.on 'submit', (e) ->
                e.preventDefault()
                $form.ajaxSubmit
                    success: (responseText, textStatus, jqXHR) ->
                        console.log responseText
                    error: (jqXHR, textStatus, errorThrown) ->
                        console.log "#{textStatus}: #{errorThrown}"

        dismiss: ->
            console.log 'Login view dismiss'
            $main = $ '#main'
            $form = $main.find 'form.themis-form-login'
            $form.off 'submit'
            $main.html ''

    new LoginView()


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


define 'viewController', ['viewControllerBase', 'renderTemplate', 'signinView', 'signupView', 'loginView'], (ViewControllerBase, renderTemplate, signinView, signupView, loginView) ->
    viewController = new ViewControllerBase()

    viewController.view(/^\/$/)
        .on 'present', ->
            $('#main').html renderTemplate 'index-view'
        .on 'dismiss', ->
            $('#main').html ''

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
