import { NextResponse } from "next/server";

/**
 * POST /api/assessment-submissions/[id]
 * * This route handles: /api/assessment-submissions/972956f5-1701...
 * It extracts the ID (972956f5...) and forwards it to the backend.
 */

const isValidEmail = (v?: unknown) =>
  typeof v === "string" && /^\S+@\S+\.\S+$/.test(v.trim());

const isValidUrl = (v?: unknown) => {
  if (typeof v !== "string") return false;
  try {
    const u = new URL(v.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

// FIX: Update params type to Promise<{ id: string }> for Next.js 15
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Get the Applicant ID from the URL path
    // In Next.js 15, we must await the params object itself
    const { id: applicantId } = await params;

    // Validate ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!applicantId || !uuidRegex.test(applicantId)) {
      return NextResponse.json({ 
        message: "Invalid submission link. The ID provided is incorrect." 
      }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const { email, githubUrl, liveDemoUrl, comments } = body ?? {};

    // 2. Validate Form Data
    if (!isValidEmail(email)) {
      return NextResponse.json({ message: "Invalid or missing email" }, { status: 400 });
    }
    if (!isValidUrl(githubUrl)) {
      return NextResponse.json({ message: "Invalid or missing GitHub repository URL" }, { status: 400 });
    }
    if (!isValidUrl(liveDemoUrl)) {
      return NextResponse.json({ message: "Invalid or missing live demo URL" }, { status: 400 });
    }

    // 3. Get Backend URL
    const backendUrl = 
      process.env.NEXT_PUBLIC_BACKEND_API_URL || 
      process.env.BACKEND_API_URL || 
      process.env.NEXT_PUBLIC_BASE_URL;

    if (!backendUrl) {
      return NextResponse.json({
        message: "System configuration error: Backend URL not set.",
      }, { status: 500 });
    }

    // 4. Submit to the Backend Endpoint: .../submit/:id
    const submitUrl = `${backendUrl.replace(/\/$/, "")}/api/v1/assessment/submit/${applicantId}`;

    const submissionPayload = {
      email: email.trim(),
      githubUrl: githubUrl.trim(),
      liveDemoUrl: liveDemoUrl.trim(),
      comments: comments ? comments.trim() : undefined,
    };

    console.log(`Submitting to backend: ${submitUrl}`);

    const submissionResp = await fetch(submitUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(submissionPayload),
    });

    const submissionBody = await submissionResp.json().catch(() => ({}));

    if (!submissionResp.ok) {
      console.error("Backend submission failed:", submissionResp.status, submissionBody);
      return NextResponse.json(
        { message: submissionBody.message || "Failed to submit assessment." },
        { status: submissionResp.status }
      );
    }

    return NextResponse.json({
      message: submissionBody.message || "Assessment submitted successfully!",
      ...submissionBody
    }, { status: 200 });

  } catch (err) {
    console.error("API route error:", err);
    return NextResponse.json({ 
      message: "An unexpected error occurred. Please try again later." 
    }, { status: 500 });
  }
}