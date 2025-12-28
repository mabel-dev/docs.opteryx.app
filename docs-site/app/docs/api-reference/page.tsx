import DocRenderer from '@/app/components/DocRenderer'

export default function Page(){
  const source = `# API Reference

This section will document the Opteryx HTTP and programmatic APIs (placeholder).`
  return <DocRenderer source={source} />
}
