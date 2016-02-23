export default class CountryModel {
  constructor (options) {
    this.id = options.id
    this.name = options.name
    this.formalName = options.formalName
  }

  getFullName () {
    if (this.formalName !== '') {
      return `${this.name} – ${this.formalName}`
    } else {
      return this.name
    }
  }
}
