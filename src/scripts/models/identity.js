export default class IdentityModel {
  constructor (options) {
    this.id = options.id || null  // admin, manager, team
    this.role = options.role
    this.name = options.name || null  // admin, manager, team
    this.email = options.email || null
    this.emailConfirmed = options.emailConfirmed || null  // team
    this.logoChecksum = options.logoChecksum || null // team
    this.token = options.token
  }

  isGuest () {
    return this.role === 'guest'
  }

  isTeam () {
    return this.role === 'team'
  }

  isExactTeam (id) {
    return this.isTeam() && this.id === id
  }

  isManager () {
    return this.role === 'manager'
  }

  isAdmin () {
    return this.role === 'admin'
  }

  isSupervisor () {
    return this.isManager() || this.isAdmin()
  }
}
