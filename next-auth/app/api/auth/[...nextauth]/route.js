import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// const handler = NextAuth({
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     }),
//   ],
// });

// export { handler as GET, handler as POST };
const handler = NextAuth({
  // หน้า sign-in (ถ้าไม่อยากให้เด้งไปหน้าอื่นคงไว้ “/” ได้)
  pages: { signIn: "/" },

  // ใช้ JWT ก็พอ (ไม่ต้องมีฐานข้อมูล)
  session: { strategy: "jwt" },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      profile(profile) {
        // map โปรไฟล์จาก Google → shape ที่อยากเก็บใน token/session
        return {
          id: profile.sub,
          name:
            profile.name ??
            `${profile.given_name ?? ""} ${profile.family_name ?? ""}`.trim(),
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, account, user, profile }) {
      // ครั้งแรกที่ login ด้วย Google → อัพเดต token จากข้อมูลโปรไฟล์
      if (account?.provider === "google" && profile) {
        token.id = profile.sub;
        token.name =
          profile.name ??
          `${profile.given_name ?? ""} ${profile.family_name ?? ""}`.trim();
        token.email = profile.email;
        token.picture = profile.picture;
      }
      // เผื่อกรณีมี user.id จาก provider อื่นในอนาคต
      if (user?.id && !token.id) token.id = user.id;
      return token;
    },

    async session({ session, token }) {
      // ส่งค่าที่ต้องใช้ให้ฝั่ง client ผ่าน session.user
      if (session?.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }
      return session;
    },

    async redirect({ baseUrl }) {
      // หลังล็อกอินแล้วกลับหน้าเดิม (จะเปลี่ยนเป็น /dashboard ก็ได้)
      return `${baseUrl}/`;
    },
  },
});

export { handler as GET, handler as POST };
