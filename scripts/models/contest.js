export default class ContestModel {
  constructor (options) {
    this.state = options.state
    this.startsAt = (options.startsAt) ? new Date(options.startsAt) : null
    this.finishesAt = (options.finishesAt) ? new Date(options.finishesAt) : null
  }

  isInitial () {
    return this.state === 1
  }

  isStarted () {
    return this.state === 2
  }

  isPaused () {
    return this.state === 3
  }

  isFinished () {
    return this.state === 4
  }
}
