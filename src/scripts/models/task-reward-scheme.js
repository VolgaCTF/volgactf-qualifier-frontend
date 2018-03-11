export default class TaskRewardSchemeModel {
  constructor (options) {
    this.id = options.id
    this.taskId = options.taskId
    this.maxValue = options.maxValue
    this.minValue = options.minValue
    this.subtractPoints = options.subtractPoints
    this.subtractHitCount = options.subtractHitCount
    this.created = new Date(options.created)
    this.updated = new Date(options.updated)
  }
}
