define 'teamScoreModel', [], ->
    class TeamScoreModel
        constructor: (options) ->
            @team = options.team
            @score = options.score
            @updatedAt = if options.updatedAt? then new Date(options.updatedAt) else null
