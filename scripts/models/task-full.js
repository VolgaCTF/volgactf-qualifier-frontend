import TaskModel from './taskModel.js'
export default class TaskFullModel extends TaskModel {
  constructor(options) {
    super(options)
    this.answers = options.answers
    this.caseSensitive = options.caseSensitive
  }
}
