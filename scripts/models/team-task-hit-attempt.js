export default class TeamTaskHitAttemptModel {
  constructor (options) {
    this.teamId = options.teamId
    this.taskId = options.taskId
    this.createdAt = new Date(options.createdAt)
    this.wrongAnswer = options.wrongAnswer
  }
}
