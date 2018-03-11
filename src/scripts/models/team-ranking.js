export default class TeamRankingModel {
  constructor (options) {
    this.id = options.id
    this.teamId = options.teamId
    this.position = options.position
    this.score = options.score
    this.lastUpdated = (options.lastUpdated) ? new Date(options.lastUpdated) : null
  }
}
