import TaskPreviewModel from './task-preview'


export default class TaskModel extends TaskPreviewModel {
  constructor(options) {
    super(options)
    this.description = options.description
    this.hints = options.hints
  }
}
