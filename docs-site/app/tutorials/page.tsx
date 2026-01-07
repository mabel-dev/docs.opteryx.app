import DocRenderer from '@/app/components/DocRenderer'

export default function Page(){
  const source = `
# Tutorials

This section will contain hands-on tutorials and examples for using Opteryx.

## Using with Jupyter Notebooks

Placeholder: step-by-step guidance for running Opteryx from Jupyter notebooks, example notebooks, and tips for interactive exploration will go here.

More tutorials (CLI, embedding, client libraries) will be added soon.
`
  return <DocRenderer source={source} />
}
