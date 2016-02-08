import $ from 'jquery'
import _ from 'underscore'


let store = null
let templates = {}

export default function renderTemplate(name, params = {}) {
  if (!templates[name]) {
    if (!store) {
      store = $('.themis-partials')
    }

    let $el = store.find(`script[type="text/x-template"][data-name="${name}"]`)
    if ($el.length > 0) {
      templates[name] = _.template($el.html())
    } else {
      templates[name] = _.template('')
    }
  }

  return templates[name](params)
}
