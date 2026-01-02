import DocRenderer from '@/app/components/DocRenderer'

export default function Page(){
  const source = `
# Security & Permissions

**Status:** Placeholder

This page will document Opteryx's security model, authentication methods, authorization controls, and permission systems.

## Coming Soon

- Authentication mechanisms
- Role-based access control (RBAC)
- Data-level permissions
- Encryption (at rest and in transit)
- Audit logging
- Network security

For API-level authentication, see the [Authentication API](/docs/reference/api/authentication-api).
`

  return <DocRenderer source={source} />
}
