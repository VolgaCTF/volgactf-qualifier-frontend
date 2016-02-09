import $ from 'jquery'
import History from 'history.js'
import queryString from 'query-string'


class StateController {
  constructor() {
    this.viewController = null
  }

  getStateData(urlPath, params = {}) {
    // AT: maybe it's a bug: replaceState won't call statechange
    // event if you reload page at the same url (e.g. Cmd+R or Ctrl+F5).
    // To workaround the problem, you can pass a unique value to state.
    // I have chosen to pass unix timestamp.
    return {
      urlPath: urlPath,
      tick: (new Date()).getTime(),
      params: params
    }
  }

  init(viewController) {
    this.viewController = viewController
    History.Adapter.bind(window, 'statechange', () => {
      let data = History.getState().data
      if (!data.urlPath) {
        data.urlPath = window.location.pathname
      }

      this.viewController.render(data.urlPath)
    })

    $(document).on('click', 'a[data-push-history]', (e) => {
      e.preventDefault()
      e.stopPropagation()
      let urlPath = $(e.target).attr('href')
      let title = this.viewController.getTitle(urlPath)

      History.pushState(this.getStateData(urlPath), title, urlPath)
    })

    let curLocation = window.location.pathname
    let queryParams = queryString.parse(window.location.search)
    let windowTitle = this.viewController.getTitle(curLocation)
    let historyData = {
      urlPath: curLocation,
      tick: (new Date()).getTime()
    }

    History.replaceState(this.getStateData(curLocation, queryParams), windowTitle, curLocation)
  }

  navigateTo(urlPath, params = {}) {
    let title = this.viewController.getTitle(urlPath)
    History.pushState(this.getStateData(urlPath, params), title, urlPath)
  }
}


export default new StateController()
