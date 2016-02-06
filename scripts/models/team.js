export default class TeamModel {
  constructor(options) {
    this.id = options.id
    this.name = options.name
    this.country = options.country
    this.locality = options.locality
    this.institution = options.institution
    this.createdAt = new Date(options.createdAt)
    this.email = if (options.email != null) ? options.email : null
    this.emailConfirmed = if (options.emailConfirmed != null) ? options.emailConfirmed : no
  }
}
