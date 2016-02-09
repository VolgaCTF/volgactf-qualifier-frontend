import $ from 'jquery'
import stateController from './controllers/state'
import viewController from './controllers/view'
import 'bootstrap'


$(document).ready(() => {
  stateController.init(viewController)
})
