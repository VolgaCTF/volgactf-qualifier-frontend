
export default class View {
  constructor (urlRegex = null) {
    this.urlRegex = urlRegex
  }

  present () {
  }

  dismiss () {
  }

  getTitle () {
    return ''
  }
}
