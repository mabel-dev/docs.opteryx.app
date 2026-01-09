import DocRenderer from '@/app/components/DocRenderer'

export default function Page(){
  const source = `
# Reading Data

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.


### Sample Datasets

- public.examples.planets
- public.examples.vulnerabilities
- public.github.events

`
  return <DocRenderer source={source} />
}
