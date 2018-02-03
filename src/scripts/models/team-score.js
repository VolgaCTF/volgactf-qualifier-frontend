export default class TeamScoreModel {
  constructor (options) {
    this.teamId = options.teamId
    this.score = options.score
    this.updatedAt = (options.updatedAt) ? new Date(options.updatedAt) : null
  }
}
