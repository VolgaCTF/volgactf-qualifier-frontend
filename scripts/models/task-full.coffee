define 'taskFullModel', ['taskModel'], (TaskModel) ->
    class TaskFullModel extends TaskModel
        constructor: (options) ->
            super options
            @answers = options.answers
            @caseSensitive = options.caseSensitive
