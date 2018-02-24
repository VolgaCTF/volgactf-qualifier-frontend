class StateController {
  constructor () {
    this.viewController = null
  }

  init (viewController) {
    this.viewController = viewController
    this.viewController.render(window.location.pathname)
  }

  navigateTo (urlPath) {
    window.location = urlPath
  }
}

export default new StateController()
