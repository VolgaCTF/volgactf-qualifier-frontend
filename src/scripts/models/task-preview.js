export default class TaskPreviewModel {
  constructor (options) {
    this.id = options.id
    this.title = options.title
    this.createdAt = new Date(options.createdAt)
    this.updatedAt = new Date(options.updatedAt)
    this.categories = options.categories
    this.state = options.state
    this.openAt = options.openAt ? new Date(options.openAt) : null
  }

  isInitial () {
    return this.state === 1
  }

  isOpened () {
    return this.state === 2
  }

  isClosed () {
    return this.state === 3
  }
}
