import DocRenderer from '@/app/components/DocRenderer'

export default function Page(){
  const source = `
# Registration

Instructions to register for Opteryx (placeholder).

## Register with Credentials

## Register with Google/Microsoft
`;
  return <DocRenderer source={source} />
}
