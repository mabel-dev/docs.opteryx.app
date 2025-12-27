import { redirect } from 'next/navigation'

export default function Page(){
  // Redirect root to the migrated docs index
  redirect('/docs')
}
