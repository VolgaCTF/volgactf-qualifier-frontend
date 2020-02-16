import _ from 'underscore'
import $ from 'jquery'
import moment from 'moment'
import View from './base'
import contestProvider from '../providers/contest'
import identityProvider from '../providers/identity'

class IndexView extends View {
  constructor () {
    super()
    this.onUpdateContest = null
  }

  render () {
    $('#main').html(window.volgactf.qualifier.templates.indexView({
      _: _,
      moment: moment,
      identity: identityProvider.getIdentity(),
      contest: contestProvider.getContest(),
      contestTitle: window.volgactf.qualifier.data.contestTitle
    }))
  }

  present () {
    this.onUpdateContest = (e) => {
      this.render()
      return false
    }

    contestProvider.on('updateContest', this.onUpdateContest)
  }
}

export default new IndexView()
