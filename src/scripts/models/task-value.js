export default class TaskValueModel {
  constructor (options) {
    this.id = options.id
    this.taskId = options.taskId
    this.value = options.value
    this.created = new Date(options.created)
    this.updated = new Date(options.updated)
  }
}
