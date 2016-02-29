export default class TaskAnswerModel {
  constructor (options) {
    this.id = options.id
    this.taskId = options.taskId
    this.answer = options.answer
    this.caseSensitive = options.caseSensitive
    this.createdAt = new Date(options.createdAt)
  }
}
