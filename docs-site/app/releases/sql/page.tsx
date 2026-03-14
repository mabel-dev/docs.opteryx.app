import DocRenderer from '@/app/components/DocRenderer'

export default function Page(){
  const source = `
# SQL Release Notes

## 2026

Placeholder: release notes for SQL engine changes, new functions, performance improvements, and compatibility notes.

Document changes to SQL semantics and new features here.

---

### How to add notes

Edit **app/releases/sql/page.tsx** and add entries under the appropriate year section.

\`\`\`
app/releases/sql/page.tsx
\`\`\`
`
  return <DocRenderer source={source} />
}
