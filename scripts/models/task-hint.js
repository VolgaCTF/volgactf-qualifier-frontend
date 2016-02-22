export default class TaskHintModel {
  constructor (options) {
    this.id = options.id
    this.taskId = options.taskId
    this.hint = options.hint
    this.createdAt = new Date(options.createdAt)
  }
}
