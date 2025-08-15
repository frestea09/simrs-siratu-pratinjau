
"use server";

import { z } from "zod";
import bcrypt from 'bcrypt';
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

import prisma from "@/lib/prisma";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET_KEY || "your-super-secret-key-that-is-long-enough");
const algorithm = "HS256";

export async function login(prevState: any, formData: FormData) {
  const validatedFields = loginSchema.safeParse(Object.fromEntries(formData));

  if (!validatedFields.success) {
    return {
      error: "Invalid fields!",
    };
  }

  const { email, password } = validatedFields.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return { error: "Invalid credentials!" };
    }

    const passwordsMatch = await bcrypt.compare(password, user.password);

    if (!passwordsMatch) {
      return { error: "Invalid credentials!" };
    }
    
    // Create JWT
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const session = await new SignJWT({ userId: user.id, role: user.role, unit: user.unit })
        .setProtectedHeader({ alg: algorithm })
        .setIssuedAt()
        .setExpirationTime(expires)
        .sign(secretKey);

    cookies().set("session", session, { expires, httpOnly: true });

    return { success: "Logged in!" };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong." };
  }
}

export async function logout() {
    cookies().set("session", "", { expires: new Date(0) });
}

export async function getSession() {
  const sessionCookie = cookies().get("session")?.value;
  if (!sessionCookie) return null;
  try {
    const { payload } = await jwtVerify(sessionCookie, secretKey, { algorithms: [algorithm] });
    return payload as { userId: string, role: string, unit?: string, iat: number, exp: number };
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser() {
    const session = await getSession();
    if (!session) return null;

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                unit: true,
            }
        });
        return user;
    } catch (error) {
        return null;
    }
}
