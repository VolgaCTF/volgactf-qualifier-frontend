define 'taskCategoryModel', [], ->
    class TaskCategoryModel
        constructor: (options) ->
            @id = options.id
            @title = options.title
            @description = options.description
            @createdAt = new Date options.createdAt
            @updatedAt = new Date options.updatedAt
