export default class TeamScoreModel {
  constructor(options) {
    this.teamId = options.teamId
    this.score = options.score
    this.updatedAt = if (options.updatedAt != null) ? new Date(options.updatedAt) : null
  }
}
