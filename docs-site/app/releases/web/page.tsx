import DocRenderer from '@/app/components/DocRenderer'

export default function Page(){
  const source = `
# Web Site Release Notes

## 2026

Placeholder: notes for website updates, content changes, and documentation site deployments.

Examples:
- 2026-01-06: Updated build to skip global npm upgrade on Alpine images.
- 2025-12-10: Added new tutorials index.
`
  return <DocRenderer source={source} />
}
