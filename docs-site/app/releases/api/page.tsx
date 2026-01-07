import DocRenderer from '@/app/components/DocRenderer'

export default function Page(){
  const source = `
# API Release Notes

## 2026

Placeholder: release notes for API changes, endpoints, versions, and migration guidance.

Add changelogs here as API versions are released.
`
  return <DocRenderer source={source} />
}
