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
