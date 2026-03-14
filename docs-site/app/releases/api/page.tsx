import DocRenderer from '@/app/components/DocRenderer'

export default function Page(){
  const source = `
# API Release Notes

## 2026

Placeholder: release notes for API changes, endpoints, versions, and migration guidance.

Add changelogs here as API versions are released.

---

### How to add notes

Edit **app/releases/api/page.tsx** and add entries under the appropriate year section.

\`\`\`
app/releases/api/page.tsx
\`\`\`
`
  return <DocRenderer source={source} />
}
