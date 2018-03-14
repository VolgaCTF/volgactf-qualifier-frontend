import View from './base'
import contestProvider from '../providers/contest'

class IndexView extends View {
  constructor () {
    super()
    this.onUpdateContest = null
  }

  render () {
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
