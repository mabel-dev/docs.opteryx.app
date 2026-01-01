import fs from 'fs'
import path from 'path'
import DocRenderer from '@/app/components/DocRenderer'

export default function Page(){
  const source = `# API Reference

This section documents the Opteryx HTTP and programmatic APIs (placeholder).`
  return <DocRenderer source={source} />
}
