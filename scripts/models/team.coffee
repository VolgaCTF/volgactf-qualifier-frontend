define 'teamModel', [], ->
    class TeamModel
        constructor: (options) ->
            @id = options.id
            @name = options.name
            @country = options.country
            @locality = options.locality
            @institution = options.institution
            @createdAt = new Date options.createdAt
            @email = if options.email? then options.email else null
            @emailConfirmed = if options.emailConfirmed? then options.emailConfirmed else no
