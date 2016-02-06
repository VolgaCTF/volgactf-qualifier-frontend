export default class ContestModel {
  constructor(options) {
    this.state = options.state
    this.startsAt = if options.startsAt? then new Date(options.startsAt) else null
    this.finishesAt = if options.finishesAt? then new Date(options.finishesAt) else null
  }

    isInitial() {
      return this.state === 1
    }

    isStarted() {
      return this.state === 2

    isPaused() {
      return this.state === 3

    isFinished() {
      return this.state === 4
    }
}
