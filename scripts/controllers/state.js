define 'stateController', ['jquery', 'jquery.history', 'query-string'], ($, History, queryString) ->
    class StateController
        constructor: ->
            @viewController = null

        getStateData: (urlPath, params = {}) ->
            # AT: maybe it's a bug: replaceState won't call statechange
            # event if you reload page at the same url (e.g. Cmd+R or Ctrl+F5).
            # To workaround the problem, you can pass a unique value to state.
            # I have chosen to pass unix timestamp.
            {
                urlPath: urlPath
                tick: (new Date()).getTime()
                params: params
            }

        init: (viewController) ->
            @viewController = viewController
            History.Adapter.bind window, 'statechange', =>
                data = History.getState().data
                unless data.urlPath?
                    data.urlPath = window.location.pathname
                @viewController.render data.urlPath

            $(document).on 'click', 'a[data-push-history]', (e) =>
                e.preventDefault()
                e.stopPropagation()
                urlPath = $(e.target).attr 'href'
                title = @viewController.getTitle urlPath

                History.pushState @getStateData(urlPath), title, urlPath

            curLocation = window.location.pathname
            queryParams = queryString.parse window.location.search
            windowTitle = @viewController.getTitle curLocation
            historyData = urlPath: curLocation, tick: (new Date()).getTime()
            History.replaceState @getStateData(curLocation, queryParams), windowTitle, curLocation

        navigateTo: (urlPath, params = {}) ->
            title = @viewController.getTitle urlPath
            History.pushState @getStateData(urlPath, params), title, urlPath

    new StateController()
