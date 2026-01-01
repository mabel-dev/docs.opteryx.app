import DocRenderer from '@/app/components/DocRenderer'

export default function Page(){
  const source = `# Reference

This consolidated Reference section combines API, SQL, and Python references.

- API Reference
- SQL Language Reference
- Python Reference

Choose a subsection from the sidebar to begin.`
  return <DocRenderer source={source} />
}
