import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { Session, User } from "next-auth";

export const authOptions = {
    adapter: PrismaAdapter(prisma),
    callbacks: {
        async session({ session, user }: { session: Session; user: User }) {
            if(session?.user) {
                session.user.id = user.id;
            }

            return session;
        }
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID ?? "",
            clientSecret: process.env.GOOGLE_SECRET ?? ""
        }),
    ],
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };