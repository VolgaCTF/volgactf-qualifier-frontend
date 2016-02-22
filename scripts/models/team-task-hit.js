export default class TeamTaskHitModel {
  constructor (options) {
    this.teamId = options.teamId
    this.taskId = options.taskId
    this.createdAt = new Date(options.createdAt)
  }
}
