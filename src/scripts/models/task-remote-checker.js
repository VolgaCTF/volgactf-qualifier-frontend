export default class TaskRemoteCheckerModel {
  constructor (options) {
    this.id = options.id
    this.taskId = options.taskId
    this.remoteCheckerId = options.remoteCheckerId
    this.createdAt = new Date(options.createdAt)
  }
}
