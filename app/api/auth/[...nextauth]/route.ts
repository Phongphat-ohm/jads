import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim() || 'unconfigured-client-id.apps.googleusercontent.com';
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim() || 'unconfigured-client-secret';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account && user) {
        token.provider = account.provider;
        token.providerAccountId = account.providerAccountId;
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session as any).provider = token.provider;
        (session as any).providerAccountId = token.providerAccountId;
        (session as any).accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'jads-court-secret-session-key',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
