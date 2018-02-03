export default class TeamTaskReviewModel {
  constructor (options) {
    this.teamId = options.teamId
    this.taskId = options.taskId
    this.rating = options.rating
    this.comment = options.comment
    this.createdAt = new Date(options.createdAt)
  }
}
