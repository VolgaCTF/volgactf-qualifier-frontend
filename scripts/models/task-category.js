export default class TaskCategoryModel {
        constructor(options) {
          this.id = options.id
          this.title = options.title
          this.description = options.description
          this.createdAt = new Date(options.createdAt)
          this.updatedAt = new Date(options.updatedAt)
	}
}
