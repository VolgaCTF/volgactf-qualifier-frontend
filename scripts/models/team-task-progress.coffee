define 'teamTaskProgressModel', [], ->
    class TeamTaskProgress
        constructor: (options) ->
            @teamId = options.teamId
            @taskId = options.taskId
            @createdAt = new Date options.createdAt
