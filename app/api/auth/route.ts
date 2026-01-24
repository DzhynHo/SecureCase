import { NextResponse } from "next/server";
import usersData from "@/data/users.json";

type User = {
  id: number;
  username: string;
  role: string;
};

const users = (usersData as any).users || usersData;

export async function GET() {
  const list = Array.isArray(users) ? users : (users as any[]);
  return NextResponse.json({
    count: list.length,
    users: list.map((u) => ({ id: u.id, username: u.username, role: u.role })),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = body?.username || body?.login;
    const password = body?.password;

    if (!username) {
      return NextResponse.json({ ok: false, message: "username required" }, { status: 400 });
    }

    const list = Array.isArray(users) ? users : (users as any[]);
    const user = list.find((u: any) => u.username === username);

    if (!user) {
      return NextResponse.json({ ok: false, message: "Invalid credentials" }, { status: 401 });
    }

    if (!password || password.length === 0) {
      return NextResponse.json({ ok: false, message: "Password required" }, { status: 400 });
    }

    // Quick local-testing rule: accept password === "password"
    if (password !== "password") {
      return NextResponse.json({ ok: false, message: "Invalid credentials" }, { status: 401 });
    }

    const safeUser = { id: user.id, username: user.username, role: user.role };
    return NextResponse.json({ ok: true, user: safeUser });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
