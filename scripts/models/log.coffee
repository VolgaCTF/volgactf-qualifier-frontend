define 'logModel', [], ->
    class LogModel
        constructor: (options) ->
            @id = options.id
            @event = options.event
            @createdAt = new Date options.createdAt
            @data = options.data
