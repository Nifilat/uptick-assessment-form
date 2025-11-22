import { NextResponse } from "next/server";

/**
 * POST /api/assessment-submissions/[id]
 * 
 * Simple proxy to backend - no authentication needed since the backend endpoint is public
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

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const applicantId = params.id;

    // Validate applicant ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!applicantId || !uuidRegex.test(applicantId)) {
      return NextResponse.json({ 
        message: "Invalid submission link. Please use the link provided in your assessment email." 
      }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const { email, githubUrl, liveDemoUrl, comments } = body ?? {};

    // Validate input
    if (!isValidEmail(email)) {
      return NextResponse.json({ message: "Invalid or missing email" }, { status: 400 });
    }
    if (!isValidUrl(githubUrl)) {
      return NextResponse.json({ message: "Invalid or missing GitHub repository URL" }, { status: 400 });
    }
    if (!isValidUrl(liveDemoUrl)) {
      return NextResponse.json({ message: "Invalid or missing live demo URL" }, { status: 400 });
    }

    // Get backend URL
    const backendUrl = process.env.NEXT_PUBLIC_BASE_URL;

    if (!backendUrl) {
      console.error("NEXT_PUBLIC_BASE_URL not configured");
      return NextResponse.json({
        message: "System configuration error. Please contact support.",
      }, { status: 500 });
    }

    // Submit directly to backend (no auth needed)
    const submitUrl = `${backendUrl.replace(/\/$/, "")}/api/v1/assessment/submit/${applicantId}`;

    const submissionPayload = {
      email: email.trim(),
      githubUrl: githubUrl.trim(),
      liveDemoUrl: liveDemoUrl.trim(),
      comments: comments.trim() || undefined,
    };

    console.log(`Submitting assessment for applicant: ${applicantId}`);

    const submissionResp = await fetch(submitUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(submissionPayload),
    });

    const submissionBody = await submissionResp.json().catch(() => ({}));

    if (!submissionResp.ok) {
      console.error("Submission failed:", submissionResp.status, submissionBody);
      
      if (submissionResp.status === 404) {
        return NextResponse.json(
          { message: "Assessment not found or already submitted. Please contact support if you believe this is an error." },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { message: submissionBody.message || "Failed to submit assessment. Please try again." },
        { status: submissionResp.status }
      );
    }

    console.log("Assessment submitted successfully");

    return NextResponse.json({
      message: submissionBody.message || "Assessment submitted successfully! We'll review it soon.",
      ...submissionBody
    }, { status: 200 });

  } catch (err) {
    console.error("API route error: /api/assessment-submissions/[id]", err);
    return NextResponse.json({ 
      message: "An unexpected error occurred. Please try again later." 
    }, { status: 500 });
  }
}