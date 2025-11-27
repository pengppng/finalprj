"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>NextAuth.js with App Router</h1>

      {!session ? (
        <>
          <p>You are not signed in</p>
          <button onClick={() => signIn("google")}>Sign In with Google</button>
        </>
      ) : (
        <>
          <p>Welcome, {session.user.name}!</p>
          <p>Email: {session.user.email}</p>
          <button onClick={() => signOut()}>Sign Out</button>
        </>
      )}
    </div>
  );
}
