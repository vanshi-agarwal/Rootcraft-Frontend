import { NextResponse } from "next/server";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().optional(),
  message: z.string().min(10),
});

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const data = contactSchema.parse(payload);

    // Simulate ticket creation (replace with real integration if available)
    const ticketId = `CNT-${Date.now().toString(36).toUpperCase()}`;

    return NextResponse.json({
      success: true,
      message: "Message received. Our team will reach out shortly.",
      ticketId,
      data,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          issues: error.flatten(),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Unable to submit message right now." },
      { status: 500 }
    );
  }
}
