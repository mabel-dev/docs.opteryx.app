import React from 'react'
import { marked } from 'marked'

type DocRendererProps = { source: string }

// Configure marked to add IDs to headings
marked.use({
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
      
      // Detect and tag callout blockquotes (Note:, TIP:, Warning:, etc.)
      processed = processed.replace(
        /<blockquote>\s*<p>\s*(Note|TIP|Tip|Warning|Caution):\s*(.*?)<\/p>/gi,
        (match, type, content) => {
          const calloutType = type.toLowerCase()
          return `<blockquote data-callout="${calloutType}"><p><strong>${type}:</strong> ${content}</p>`
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
