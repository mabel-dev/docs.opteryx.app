import DocRenderer from '../../components/DocRenderer'

export default function Page(){
  const source = `# Introduction

Welcome to Opteryx documentation. Use the sections on the left to explore topics.`
  return <DocRenderer source={source} />
}
