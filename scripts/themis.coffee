require.config
    baseUrl: '/js'
    shim:
        'jquery.history':
            deps: ['jquery']
            exports: 'History'
        bootstrap: ['jquery']

define 'themis', ['jquery', 'underscore', 'jquery.history', 'bootstrap'], ($, _, History) ->
    $(document).ready ->
