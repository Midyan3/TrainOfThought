import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get("sortBy") || "newest";

    let orderBy: any = {};

    switch (sortBy) {
      case "mostLiked":
        orderBy = { likes: "desc" };
        break;
      case "mostDisliked":
        orderBy = { dislikes: "desc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
    }

    const messages = await prisma.message.findMany({
      orderBy,
      take: 20,
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { message: "Failed to fetch messages" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || text.trim() === "") {
      return NextResponse.json(
        { message: "Message content is required" },
        { status: 400 },
      );
    }

    const newMessage = await prisma.message.create({
      data: {
        text,
        likes: 0,
        dislikes: 0,
      },
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { message: "Failed to create message" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action } = body;

    if (!id || !action) {
      return NextResponse.json(
        { message: "Message ID and action are required" },
        { status: 400 },
      );
    }

    if (action !== "like" && action !== "dislike") {
      return NextResponse.json(
        { message: 'Invalid action. Use "like" or "dislike"' },
        { status: 400 },
      );
    }

    const message = await prisma.message.findUnique({ where: { id } });

    if (!message) {
      return NextResponse.json(
        { message: "Message not found" },
        { status: 404 },
      );
    }

    const updatedMessage = await prisma.message.update({
      where: { id },
      data: {
        likes: action === "like" ? message.likes + 1 : message.likes,
        dislikes:
          action === "dislike" ? message.dislikes + 1 : message.dislikes,
      },
    });

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error("Error updating message:", error);
    return NextResponse.json(
      { message: "Failed to update message" },
      { status: 500 },
    );
  }
}