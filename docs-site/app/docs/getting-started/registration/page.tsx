import DocRenderer from '@/app/components/DocRenderer'

export default function Page(){
  const source = `# Registration

Instructions to register for Opteryx (placeholder).`;
  return <DocRenderer source={source} />
}
