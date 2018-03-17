import MarkdownIt from 'markdown-it'
import twemoji from 'twemoji'
import emoji from 'markdown-it-emoji'
import sub from 'markdown-it-sub'
import sup from 'markdown-it-sup'
import ins from 'markdown-it-ins'
import mark from 'markdown-it-mark'
import linkAttributes from 'markdown-it-link-attributes'

export default class MarkdownRenderer {
  constructor () {
    this.md = new MarkdownIt()
    this.md
      .use(emoji, {})
      .use(mark)
      .use(ins)
      .use(sup)
      .use(sub)
      .use(linkAttributes, {
        attrs: {
          target: '_blank',
          rel: 'noopener'
        }
      })

    this.md.renderer.rules.emoji = (token, idx) => {
      return twemoji.parse(token[idx].content)
    }
  }

  render (data) {
    return this.md.render(data)
  }
}
