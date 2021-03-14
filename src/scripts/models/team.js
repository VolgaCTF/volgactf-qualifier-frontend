export default class TeamModel {
  constructor (options) {
    this.id = options.id
    this.name = options.name
    this.countryId = options.countryId
    this.locality = options.locality
    this.institution = options.institution
    this.createdAt = new Date(options.createdAt)
    this.email = (options.email) ? options.email : null
    this.emailConfirmed = (options.emailConfirmed) ? options.emailConfirmed : false
    this.disqualified = options.disqualified
    this.ctftimeTeamId = options.ctftimeTeamId
    if (options.passwordSet) {
      this.passwordSet = options.passwordSet
    }
    this.logoChecksum = options.logoChecksum || 'deadbeef'
  }
}
