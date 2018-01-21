export default class CountryModel {
  constructor (options) {
    this.id = options.id
    this.code = options.code
    this.name = options.name
  }

  getName () {
    return this.name
  }
}
