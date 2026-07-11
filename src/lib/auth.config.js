export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.kycStatus = user.kycStatus;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.kycStatus = token.kycStatus;
      }
      return session;
    },
  },
  providers: [], // filled in by auth.js — kept empty here so this file has zero Node.js dependencies
  secret: process.env.NEXTAUTH_SECRET,
};