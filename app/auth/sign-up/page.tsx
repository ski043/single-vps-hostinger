import { connection } from "next/server";

import { AuthPage } from "@/components/auth";

export default async function SignUpPage() {
  await connection();

  return (
    <AuthPage
      mode="sign-up"
      providers={{
        github: Boolean(
          process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET,
        ),
        google: Boolean(
          process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
        ),
      }}
    />
  );
}
