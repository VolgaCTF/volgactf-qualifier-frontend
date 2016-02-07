import $ from 'jquery'
import _ from 'underscore'

let store = null
let templates = {}
  
renderTemplate(name, params = {}) {
  if (!templates[name]) {
    if (!store) {
      store = $ ('.themis-partials')
    }
    $el = store.find("script[type=\"text/x-template\"][data-name=\"#{name}\"]")
    if ($el.length > 0) {
      templates[name] = _.template($el.html())
    } else
      templates[name] = _.template('')
    }  
    return templates[name](params)
}

export default renderTemplate
