export default class TaskFileModel {
  constructor (options) {
    this.id = options.id
    this.taskId = options.taskId
    this.prefix = options.prefix
    this.filename = options.filename
    this.createdAt = new Date(options.createdAt)
  }
}
