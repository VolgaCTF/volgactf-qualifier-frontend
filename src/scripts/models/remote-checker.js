export default class RemoteCheckerModel {
  constructor (options) {
    this.id = options.id
    this.name = options.name
    this.url = options.url
    this.authUsername = options.authUsername
    this.createdAt = new Date(options.createdAt)
    this.updatedAt = new Date(options.updatedAt)
  }
}
