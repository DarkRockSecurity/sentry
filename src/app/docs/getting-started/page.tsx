import { DocTitle, Lead, H2, H3, P, UL, LI, Code, Pre, Note } from "@/components/docs/Prose";

export const metadata = { title: "Getting started · Sentry Docs" };

export default function GettingStarted() {
  return (
    <>
      <DocTitle eyebrow="Get started">Getting started</DocTitle>
      <Lead>
        Install dependencies, configure environment variables, and sign in to your local Sentry instance in under five minutes.
      </Lead>

      <H2 id="prerequisites">Prerequisites</H2>
      <UL>
        <LI>Node.js 20+ and npm 10+</LI>
        <LI>A PostgreSQL connection (any provider; <Code>prisma+postgres</Code> works locally)</LI>
        <LI>A modern browser (Chrome, Edge, Safari, Firefox)</LI>
      </UL>

      <H2 id="install">1. Install</H2>
      <Pre>{`git clone https://github.com/DRCalexbates26/sentry.git
cd sentry
npm install`}</Pre>

      <H2 id="environment">2. Environment</H2>
      <P>
        Copy <Code>.env.example</Code> to <Code>.env</Code> and fill in the values. The single-user
        credentials are stored as a bcrypt hash &mdash; never plaintext.
      </P>
      <Pre>{`# Generate a strong NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"

# Hash a password
node -e "console.log(require('bcryptjs').hashSync(process.argv[1], 12))" 'your-password'`}</Pre>

      <Note>
        The hash &mdash; not the plaintext &mdash; goes into <Code>SENTRY_AUTH_USER_PASSWORD_HASH</Code>. Treat <Code>.env</Code> as a secret. It is gitignored by default.
      </Note>

      <H3 id="env-keys">Required keys</H3>
      <UL>
        <LI><Code>DATABASE_URL</Code> &mdash; Postgres connection string</LI>
        <LI><Code>NEXTAUTH_URL</Code> &mdash; e.g. <Code>http://localhost:3000</Code></LI>
        <LI><Code>NEXTAUTH_SECRET</Code> &mdash; random 48+ byte base64 string</LI>
        <LI><Code>SENTRY_AUTH_USER_EMAIL</Code> &mdash; the email you sign in with</LI>
        <LI><Code>SENTRY_AUTH_USER_NAME</Code> &mdash; display name</LI>
        <LI><Code>SENTRY_AUTH_USER_PASSWORD_HASH</Code> &mdash; bcrypt hash of your password</LI>
      </UL>

      <H2 id="run">3. Run</H2>
      <Pre>{`npx prisma generate
npm run dev`}</Pre>
      <P>
        Open <Code>http://localhost:3000</Code> for the marketing homepage. Click <strong>Sign in</strong> and use
        the credentials you configured. On success you&rsquo;ll be redirected to the application at <Code>/app</Code>.
      </P>

      <H2 id="signin">4. Signing in</H2>
      <UL>
        <LI>The login form lives at <Code>/login</Code>.</LI>
        <LI>One credential is supported in the current single-tenant phase.</LI>
        <LI>Sessions are JWTs with an 8-hour TTL.</LI>
      </UL>

      <H2 id="next">Next steps</H2>
      <UL>
        <LI>Read the <a href="/docs/modules" style={{ color: "#33C4B8" }}>Modules reference</a> to understand each capability.</LI>
        <LI>Read the <a href="/docs/architecture" style={{ color: "#33C4B8" }}>Architecture</a> page for how the pieces fit together.</LI>
      </UL>
    </>
  );
}
