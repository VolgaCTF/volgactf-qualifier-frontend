require.config
    shim:
        'jquery.history':
            deps: ['jquery']
            exports: 'History'
        bootstrap: ['jquery']
        'bootstrap-filestyle': ['bootstrap']


define 'themisDataStore', ['EventEmitter'], (EventEmitter) ->
    class DataStore extends EventEmitter
        constructor: ->
            super()
            console.log 'DataStore created!'

            @identity = null

    new DataStore()


define 'themisPageView', ['jquery', 'EventEmitter'], ($, EventEmitter) ->
    class PageView extends EventEmitter
        constructor: (title, selector, urlRegex) ->
            super()
            @title = title
            @container = $ selector
            @urlRegex = urlRegex

        show: ->
            @container.show()

        hide: ->
            @container.hide()

        accessAllowed: ->
            yes

    PageView


define 'themisTemplateStore', ['jquery', 'underscore'], ($, _) ->
    class TemplateStore
        constructor: ->
            @store = null
            @templates = {}

        render: (name, params = {}) ->
            unless @templates[name]?
                unless @store?
                    @store = $ '.themis-partials'

                $el = @store.find "script[type=\"text/x-template\"][data-name=\"#{name}\"]"
                if $el.length > 0
                    @templates[name] = _.template $el.html()
                else
                    @templates[name] = _.template ''

            @templates[name] params

    new TemplateStore()


define 'themisIndexPageView', ['themisPageView'], (ThemisPageView) ->
    class IndexPageView extends ThemisPageView
        constructor: ->
            super 'VolgaCTF 2015 Quals', '.themis-pages [data-page=index]', /^\/$/

    IndexPageView


define 'themisSigninPageView', ['jquery', 'themisPageView', 'jquery.form'], ($, ThemisPageView) ->
    class SigninPageView extends ThemisPageView
        constructor: ->
            super 'VolgaCTF 2015 Quals: Sign in', '.themis-pages [data-page=signin]', /^\/signin$/
            $form = @container.find 'form.themis-form-signin'
            $form.on 'submit.themis', (e) ->
                e.preventDefault()
                $form.ajaxSubmit
                    success: (responseText, textStatus, jqXHR) ->
                        console.log responseText

    SigninPageView


define 'themisSignupPageView', ['jquery', 'themisPageView', 'jquery.form'], ($, ThemisPageView) ->
    class SignupPageView extends ThemisPageView
        constructor: ->
            super 'VolgaCTF 2015 Quals: Sign up', '.themis-pages [data-page=signup]', /^\/signup$/
            $form = @container.find 'form.themis-form-signup'
            $form.on 'submit.themis', (e) ->
                e.preventDefault()
                $form.ajaxSubmit
                    success: (responseText, textStatus, jqXHR) ->
                        console.log responseText

    SignupPageView


define 'themisPageStore', ['underscore', 'EventEmitter', 'themisPageView',
                           'themisTemplateStore', 'themisIndexPageView',
                           'themisSigninPageView', 'themisSignupPageView'], (_, EventEmitter, ThemisPageView, themisTemplateStore, ThemisIndexPageView, ThemisSigninPageView, ThemisSignupPageView) ->
    class ErrorNotFoundPageView extends ThemisPageView
        constructor: ->
            super 'Not Found', '.themis-pages [data-page=error-not-found]', null

        show: ->
            $el = @container.find 'section'
            $el.html themisTemplateStore.render 'error-not-found', urlPath: window.location.pathname
            super

    class PageStore extends EventEmitter
        constructor: ->
            console.log 'PageStore created!'
            @pages = []
            @errorNotFoundPage = new ErrorNotFoundPageView()

        add: (page) ->
            @pages.push page
            @

        find: (hash) ->
            found = _.find @pages, (p) ->
                p.urlRegex.test hash

            if found?
                page = found
            else
                page = @errorNotFoundPage

    new PageStore()
        .add new ThemisIndexPageView()
        .add new ThemisSigninPageView()
        .add new ThemisSignupPageView()


define 'themisViewController', ['jquery', 'themisPageStore', 'jquery.history'], ($, themisPageStore, History) ->
    class ViewController
        constructor: ->
            console.log 'ViewController created!'
            @activePageView = null
            $(document).ready =>
                History.Adapter.bind window, 'statechange', =>
                    data = History.getState().data
                    unless data.urlPath?
                        data.urlPath = window.location.pathname
                    page = themisPageStore.find data.urlPath

                    @activePageView?.hide()
                    @activePageView = page
                    @activePageView.show()

                $(document).on 'click.themis', 'a[data-push-history]', (e) ->
                    e.preventDefault()
                    e.stopPropagation()
                    urlPath = $(e.target).attr 'href'
                    page = themisPageStore.find urlPath

                    History.pushState urlPath: urlPath, page.title, urlPath

                History.Adapter.trigger window, 'statechange'

    new ViewController()

define 'themis', ['jquery', 'themisDataStore', 'themisPageStore', 'themisViewController', 'bootstrap', 'bootstrap-filestyle'], ($, themisDataStore, themisViewController) ->
    $(document).ready ->
        console.log themisDataStore.identity
