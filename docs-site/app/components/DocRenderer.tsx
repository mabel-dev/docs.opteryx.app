import React from 'react'
import { marked } from 'marked'

type DocRendererProps = { source: string }

export default function DocRenderer({ source }: DocRendererProps){
  // Convert markdown/inline HTML to sanitized HTML (marked does not sanitize by default)
  const html = marked.parse(source || '')

  return (
    <article className="doc-renderer" dangerouslySetInnerHTML={{ __html: html }} />
  )
}
