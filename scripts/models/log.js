export default class LogModel {
  constructor (options) {
    this.id = options.id
    this.event = options.event
    this.createdAt = new Date(options.createdAt)
    this.data = options.data
  }
}
