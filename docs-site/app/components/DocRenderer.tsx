import React from 'react'
import { marked } from 'marked'

type DocRendererProps = { source: string }

// Configure marked to add IDs to headings and enable GFM tables
marked.use({
  gfm: true,
  breaks: false,
  hooks: {
    postprocess(html) {
      // Add IDs to h2 and h3 tags for TOC linking
      let processed = html.replace(/<(h[23])>(.*?)<\/\1>/gi, (match, tag, content) => {
        const id = content
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim()
        return `<${tag} id="${id}">${content}</${tag}>`
      })
      
      // Detect and tag callout blockquotes (Tip:, Be Aware:, etc.)
      processed = processed.replace(
        /<blockquote>\s*<p>\s*(Tip|TIP|Be Aware|Warning|Caution):\s*(.*?)<\/p>/gi,
        (match, type, content) => {
          const normalizedType = type.toLowerCase().replace(/\s+/g, '')
          const displayTitle = type.charAt(0).toUpperCase() + type.slice(1)
          const iconPath = normalizedType === 'tip' ? '/images/bulb-outline.svg' : '/images/warning-outline.svg'
          
          return `<blockquote data-callout="${normalizedType}">
            <div class="callout-header">
              <img src="${iconPath}" alt="" class="callout-icon" />
              <div class="callout-title">${displayTitle}</div>
            </div>
            <p class="callout-content">${content}</p>`
        }
      )
      
      return processed
    }
  }
})

export default function DocRenderer({ source }: DocRendererProps){
  // Convert markdown/inline HTML to sanitized HTML (marked does not sanitize by default)
  const html = marked.parse(source || '')

  return (
    <main className="doc-container">
      <article className="doc-renderer" dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  )
}
