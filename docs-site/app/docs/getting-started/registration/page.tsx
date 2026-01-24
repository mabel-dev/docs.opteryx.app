import DocRenderer from '@/app/components/DocRenderer'

export default function Page(){
  const source = `
# Logging In

This page explains how to sign in to Opteryx using the web UI. Opteryx supports OAuth sign-in with Google, Microsoft and GitHub. API tokens and personal access tokens are managed from the Operyx Studio settings pages.

## Browser sign-in (recommended)

1. Open the Opteryx Studio web app and click "Sign in".
2. Choose your provider (Google, Microsoft, or GitHub).
3. Complete the provider's consent screen. On success you'll be redirected back to Opteryx.
4. If this is your first sign-in, you may be asked to pick a username or complete a short onboarding flow.

Notes:

- OAuth is used for interactive access only. Tokens and API keys are created and managed from the **Settings** → **API Tokens** page in Operyx Studio.
- If you need a programmatic token, create one in Studio and copy it; treat it like a password.
- For organization-managed accounts we support SSO via Google and Microsoft where your identity provider enforces access policies.

## Troubleshooting

- If sign-in fails, check your browser's popup blocker and ensure the provider is allowed to redirect to the Operyx domain.
- If you cannot sign in, contact your workspace administrator to confirm access.
`;
  return <DocRenderer source={source} />
}
