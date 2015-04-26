define 'teamScoreModel', [], ->
    class TeamScoreModel
        constructor: (options) ->
            @teamId = options.teamId
            @score = options.score
            @updatedAt = if options.updatedAt? then new Date(options.updatedAt) else null
