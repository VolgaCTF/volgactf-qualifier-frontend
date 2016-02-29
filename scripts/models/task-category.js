export default class TaskCategoryModel {
  constructor (options) {
    this.id = options.id
    this.taskId = options.taskId
    this.categoryId = options.categoryId
    this.createdAt = new Date(options.createdAt)
  }
}
