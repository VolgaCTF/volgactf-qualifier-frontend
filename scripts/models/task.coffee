define 'taskModel', ['taskPreviewModel'], (TaskPreviewModel) ->
    class TaskModel extends TaskPreviewModel
        constructor: (options) ->
            super options
            @description = options.description
            @hints = options.hints
