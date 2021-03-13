import $ from 'jquery'
import View from '../../../base'

class TeamCtftimeOauthStartView extends View {
  constructor () {
    super()
    this.$main = null
  }

  present () {
    this.$main = $('#main')
  }
}

export default new TeamCtftimeOauthStartView()
