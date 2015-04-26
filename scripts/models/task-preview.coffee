define 'taskPreviewModel', [], ->
    class TaskPreviewModel
        constructor: (options) ->
            @id = options.id
            @title = options.title
            @value = options.value
            @createdAt = new Date options.createdAt
            @updatedAt = new Date options.updatedAt
            @categories = options.categories
            @state = options.state

        isInitial: ->
            @state is 1

        isOpened: ->
            @state is 2

        isClosed: ->
            @state is 3
