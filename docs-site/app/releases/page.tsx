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

Each section will contain chronological notes about changes, fixes, and improvements.
`
  return <DocRenderer source={source} />
}
