import DocRenderer from '@/app/components/DocRenderer'

export default function Page(){
  const source = `# Python Reference

This section will cover Python integrations, including SQLAlchemy usage and examples (placeholder).`
  return <DocRenderer source={source} />
}
