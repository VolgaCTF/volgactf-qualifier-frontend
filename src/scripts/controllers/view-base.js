import _ from 'underscore'

export default class ViewControllerBase {
  constructor () {
    this.views = []
    this.activeView = null
    this.errorViews = {}
  }

  view (view) {
    this.views.push(view)
    return view
  }

  errorView (name, view) {
    this.errorViews[name] = view
    return view
  }

  findView (urlPath) {
    let found = _.find(this.views, (view) => {
      return view.urlRegex.test(urlPath)
    })

    if (found) {
      return found
    } else {
      return this.errorViews['not-found']
    }
  }

  getTitle (urlPath) {
    return this.findView(urlPath).getTitle()
  }

  render (urlPath) {
    let newView = this.findView(urlPath)
    if (this.activeView) {
      this.activeView.dismiss()
    }

    this.activeView = newView
    this.activeView.present()
  }
}
