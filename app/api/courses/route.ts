import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { sql } from '@vercel/postgres';
import { nanoid } from 'nanoid';
import { courseSchema } from "@/lib/db/schema";

export async function POST(req: Request) {
  const session = await getServerSession();
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const validatedData = courseSchema.parse({
      ...body,
      id: nanoid(),
      instructorId: session.user.id,
      status: "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await sql`
      INSERT INTO courses (
        id, title, description, category, level, price,
        instructor_id, requirements, outcomes, status,
        created_at, updated_at
      ) VALUES (
        ${validatedData.id},
        ${validatedData.title},
        ${validatedData.description},
        ${validatedData.category},
        ${validatedData.level},
        ${validatedData.price},
        ${validatedData.instructorId},
        ${JSON.stringify(validatedData.requirements)},
        ${JSON.stringify(validatedData.outcomes)},
        ${validatedData.status},
        ${validatedData.createdAt},
        ${validatedData.updatedAt}
      )
      RETURNING *
    `;

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error creating course:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}