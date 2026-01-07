import DocRenderer from '@/app/components/DocRenderer'

export default function Page(){
  const source = `
# SQL Release Notes

## 2026

Placeholder: release notes for SQL engine changes, new functions, performance improvements, and compatibility notes.

Document changes to SQL semantics and new features here.
`
  return <DocRenderer source={source} />
}
