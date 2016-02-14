import MarkdownIt from 'markdown-it'
import twemoji from 'twemoji'
import emoji from 'markdown-it-emoji'
import sub from 'markdown-it-sub'
import sup from 'markdown-it-sup'
import ins from 'markdown-it-ins'
import mark from 'markdown-it-mark'


export default class MarkdownRenderer {
  constructor() {
    this.md = new MarkdownIt()
    this.md
            .use(emoji, {})
            .use(mark)
	    .use(ins)
	    .use(sup)
            .use(sub) 
    this.md.renderer.rules.emoji = (token, idx) => {
      return twemoji.parse(token[idx].content)							        
    }
  }
  
  render(data) {
    return this.md.render(data)
  }
}
