export default class TaskPreviewModel {
  constructor(options) {
    this.id = options.id
    this.title = options.title
    this.value = options.value
    this.createdAt = new Date(options.createdAt)
    this.updatedAt = new Date(options.updatedAt)
    this.categories = options.categories
    this.state = options.state
  }
  
  isInitial() {
    return state === 1
  }	    

  isOpened() {
    return state === 2
  }
  
  isClosed() {
    return state === 3
  }
}

