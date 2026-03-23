export default class TaskFileModel {
  constructor (options) {
    this.id = options.id
    this.taskId = options.taskId
    this.filename = options.filename
    this.remote = options.remote
    this.downloadUrl = options.downloadUrl
    this.createdAt = new Date(options.createdAt)
  }
}
