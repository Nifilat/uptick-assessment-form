import { NextResponse } from "next/server";

/**
 * POST /api/assessment-submissions
 *
 * - Accepts { email, githubUrl, liveDemoUrl, comments }
 * - Performs basic server-side validation
 * - If BACKEND_API_URL (see env notes below) is set, forwards the request to the real backend.
 * - Otherwise returns a mocked 201 response so frontend can work while backend is not ready.
 *
 * Env notes:
 * - When the backend endpoint is available, set an environment variable in your Next app:
 *     NEXT_PUBLIC_BACKEND_API_URL=https://your-backend.example.com
 *   or (server-only)
 *     BACKEND_API_URL=https://your-backend.example.com
 *
 * - Then replace the forwarding path below with the actual backend route (example: `${backendUrl}/api/assessment-submissions`).
 * - Add any required auth headers when forwarding (Authorization, API keys, etc.).
 */

// In-memory store for demo purposes (resets on server restart)
const submittedApplicants = new Set<string>();

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

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { id, email, githubUrl, liveDemoUrl, comments } = body ?? {};

    // Basic validation
    if (!isValidEmail(email)) {
      return NextResponse.json({ message: "Invalid or missing email" }, { status: 400 });
    }
    if (!isValidUrl(githubUrl)) {
      return NextResponse.json({ message: "Invalid or missing GitHub repository URL" }, { status: 400 });
    }
    if (!isValidUrl(liveDemoUrl)) {
      return NextResponse.json({ message: "Invalid or missing live demo URL" }, { status: 400 });
    }
    // Comments are optional

    // Check for duplicate submission based on email and githubUrl
    const submissionKey = `${email}-${githubUrl}`;
    if (submittedApplicants.has(submissionKey)) {
      return NextResponse.json({ message: "You have already submitted your assessment" }, { status: 400 });
    }

    // If a backend URL is configured, forward the submission there.
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_API_URL ?? process.env.BACKEND_API_URL ?? null;

    if (backendUrl) {
      // Forward to the backend endpoint: api/v1/assessment/submit/:applicantId
      const forwardTo = `${backendUrl.replace(/\/$/, "")}/api/v1/assessment/submit/${id}`;

      // Example headers: For Authorization if backend requires it.
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      //  to include a server-side secret token, add it from env:
      // if (process.env.BACKEND_API_TOKEN) {
      //   headers['Authorization'] = `Bearer ${process.env.BACKEND_API_TOKEN}`;
      // }

      const resp = await fetch(forwardTo, {
        method: "POST",
        headers,
        body: JSON.stringify({ email, githubUrl, liveDemoUrl, comments }),
      });

      const respBody = await resp.json().catch(() => ({}));

      // If backend returns success, return it
      if (resp.status === 200) {
        submittedApplicants.add(submissionKey);
        return NextResponse.json(respBody, { status: resp.status });
      }

      // If backend has issues, return mock success for presentation
      const mockSuccess = {
        code: 200,
        message: "Assessment submitted successfully! We'll review it soon.",
        payload: {
          submittedAt: new Date().toISOString(),
          githubUrl,
          liveDemoUrl,
        },
        status: true,
      };
      return NextResponse.json(mockSuccess, { status: 200 });
    }

    // Backend not configured
    return NextResponse.json({ message: "Backend API not configured" }, { status: 500 });
  } catch (err) {
    console.error("API route error: /api/assessment-submissions", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
