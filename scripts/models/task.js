import TaskPreviewModel from './taskPreviewModel.js' 
export default class TaskModel extends TaskPreviewModel {
  constructor(options) {
    super options
    this.description = options.description
    this.hints = options.hints
  }
}
