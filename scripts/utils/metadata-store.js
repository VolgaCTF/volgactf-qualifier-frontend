import $ from 'jquery'

class MetadataStore {
  constructor() {
    this.metadata = {}
  }

  getMetadata (name) {
    if (!this.metadata[name]) {	  
      $el = $ ("script[type=\"text/x-metadata\"][data-name=\"#{name}\"]")
      if $el.length > 0 {
        this.metadata[name] = $el.data('value')
      } else {
        this.metadata[name] = null
      }
    }
    return this.metadata[name]
  }    
}
  
export default new MetadataStore()
