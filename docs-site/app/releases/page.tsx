import DocRenderer from '@/app/components/DocRenderer'

export default function Page(){
  const source = `
# Releases

This page contains release notes and changelogs for the project. Choose a section below:

## Web Site Release Notes

[Release Notes](/releases/web)

## API Release Notes

[Release Notes](/releases/api)

## SQL Release Notes

[Release Notes](/releases/sql)

---

### How to add new release notes

To add notes, edit the corresponding file under **app/releases/**:

\`\`\`
app/releases/web/page.tsx
app/releases/api/page.tsx
app/releases/sql/page.tsx
\`\`\`

Just insert new entries under the appropriate year heading.
`
  return <DocRenderer source={source} />
}
