import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function DocRenderer({ source }: { source: string }){
  // strip YAML frontmatter if present
  const fm = /^---\n[\s\S]*?\n---\n/;
  const md = source.replace(fm, '')
  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
}
