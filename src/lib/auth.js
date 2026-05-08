import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { connectToDb } from "./utils";
import { User } from "./models";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

const login = async (credentials) => {
  try {
    await connectToDb();

    const user = await User.findOne({ username: credentials.username });

    if (!user) throw new Error("Неправильні облікові дані!");

    const isPasswordCorrect = await bcrypt.compare(
      credentials.password,
      user.password
    );

    if (!isPasswordCorrect) throw new Error("Неправильні облікові дані!");

    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      image: user.img,
      isAdmin: user.isAdmin,
    };
  } catch (err) {
    console.log(err);
    throw new Error("Не вийшло увійти!");
  }
};

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,

  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        try {
          const user = await login(credentials);
          return user;
        } catch (err) {
          return null;
        }
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    ...authConfig.callbacks,

    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await connectToDb();

        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          await User.create({
            username: user.name || user.email.split("@")[0],
            email: user.email,
            img: user.image,
            isAdmin: false,
          });
        }
      }

      return true;
    },

    async jwt({ token, user, account }) {
      if (account?.provider === "google") {
        await connectToDb();

        const dbUser = await User.findOne({ email: token.email });

        if (dbUser) {
          token.id = dbUser._id.toString();
          token.isAdmin = dbUser.isAdmin;
        }
      }

      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.isAdmin = token.isAdmin;
      }

      return session;
    },
  },
});