"use client";
import React, { JSX, useState } from "react";
import AssessmentButton from "../button/AssessmentButton";
import Image from "next/image";


/**
 * AssessmentForm
 *
 * - Fields: email, githubLink, liveDemoLink, comments (all required)
 * - Client-side validation with inline errors
 * - Disabled submit while submitting
 * - POSTs to /api/assessment-submissions (see src/app/api/assessment-submissions/route.ts)
 *
 * Notes for backend integration:
 * - Keep posting to /api/assessment-submissions and the route will forward to the real backend once configured.
 */

type Errors = {
  email?: string;
  githubLink?: string;
  liveDemoLink?: string;
  comments?: string;
  form?: string;
};

type SuccessPayload = {
  message: string;
  email: string;
  githubUrl: string;
  liveDemoUrl: string;
  comments: string;
};

export default function AssessmentForm({ assessmentId }: { assessmentId: string }): JSX.Element {
  const [email, setEmail] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [liveDemoLink, setLiveDemoLink] = useState("");
  const [comments, setComments] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successData, setSuccessData] = useState<SuccessPayload | null>(null);

  // const primaryBlue = "#477BFF";
  const darkNavy = "#000523";

  const isValidEmail = (v: string) => /^\S+@\S+\.\S+$/.test(v.trim());

  const isValidUrl = (v: string) => {
    try {
      const url = new URL(v.trim());
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  const validate = (): boolean => {
    const next: Errors = {};
    if (!email.trim()) next.email = "Email is required.";
    else if (!isValidEmail(email)) next.email = "Enter a valid email address.";

    if (!githubLink.trim()) next.githubLink = "GitHub repository link is required.";
    else if (!isValidUrl(githubLink)) next.githubLink = "Enter a valid GitHub repository URL.";

    if (!liveDemoLink.trim()) next.liveDemoLink = "Live demo link is required.";
    else if (!isValidUrl(liveDemoLink)) next.liveDemoLink = "Enter a valid URL for the live demo.";



    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    setSuccess(false);
    setSuccessData(null);
    if (!validate()) return;

    setSubmitting(true);
    setErrors({});

    const submission = {
      id: assessmentId,
      email: email.trim(),
      githubUrl: githubLink.trim(),
      liveDemoUrl: liveDemoLink.trim(),
      comments: comments.trim(),
    };

    try {
      const res = await fetch("/api/assessment-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
      });

      if (!res.ok) {
        // Expect API route to return JSON { message: '...' } for errors
        const body = await res.json().catch(() => ({}));
        setErrors({ form: body?.message || "Submission failed. Please try again." });
        setSubmitting(false);
        return;
      }

      // Success
      const body = (await res.json().catch(() => null)) as { message?: string } | null;
      const messageFromBackend =
        body && typeof body.message === "string"
          ? body.message
          : "Assessment submitted successfully! We'll review it soon.";

      setSuccessData({
        message: messageFromBackend,
        email: submission.email,
        githubUrl: submission.githubUrl,
        liveDemoUrl: submission.liveDemoUrl,
        comments: submission.comments,
      });

      setSuccess(true);
      setEmail("");
      setGithubLink("");
      setLiveDemoLink("");
      setComments("");
    } catch (err) {
      // Log the error to use the variable and aid debugging
      console.error(err);
      setErrors({ form: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="">
      <div className="flex items-left ml-20 ">
     
      </div>
    <div className="px-4">
      
      <div className="bg-white dark:bg-[#0b1220] rounded-xl shadow-lg overflow-hidden">
        {/* Header / Logo area */}
        
        <div className="flex items-center gap-4 p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            {/* Use public URL for images placed in frontend/public */}
            {/* <Image src="/uptick-logo.svg" alt="Uptick logo" width={48} height={48} /> */}
            {/* <Image src="/uptick-logo.svg" alt="Uptick logo" width={48} height={48} /> */}
            <div
              className=" flex items-center justify-center rounded-lg"
              
              aria-hidden
            >
                 <Image src="/uptick-logo.svg" alt="Uptick logo" width={200} height={200} />
              {/* <div
                className="w-10 h-10 rounded-md flex items-center justify-center text-white font-semibold"
                style={{ backgroundColor: primaryBlue }}
              >
                
              </div> */}
            </div>
          </div>

          <div>
            <h1 className="text-base md:text-lg font-semibold" style={{ color: darkNavy }}>
              Take-Home Assessment Submission Form
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Submit your completed assessment so the Uptick team can review. Provide your email, GitHub repo, live demo URL, and any comments.
            </p>
          </div>
        </div>

        {/* Form */}
        <form className="p-6" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4">
            <div>
              <label htmlFor="email" className="text-sm font-medium block">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 block w-full px-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#477BFF] text-base"
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                minLength={4}
              />
              {errors.email && (
                <p id="email-error" className="mt-1 text-xs text-red-600">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="github" className="text-sm font-medium block">
                GitHub Repository (project)
              </label>
              <input
                id="github"
                name="github"
                type="url"
                value={githubLink}
                onChange={(e) => setGithubLink(e.target.value)}
                className="mt-2 block w-full px-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#477BFF] text-base"
                placeholder="https://github.com/username/repo"
                aria-invalid={!!errors.githubLink}
                aria-describedby={errors.githubLink ? "github-error" : undefined}
              />
              {errors.githubLink && (
                <p id="github-error" className="mt-1 text-xs text-red-600">
                  {errors.githubLink}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="liveDemo" className="text-sm font-medium block">
                Live Demo URL
              </label>
              <input
                id="liveDemo"
                name="liveDemo"
                type="url"
                value={liveDemoLink}
                onChange={(e) => setLiveDemoLink(e.target.value)}
                className="mt-2 block w-full px-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#477BFF] text-base"
                placeholder="https://your-demo.example.com"
                aria-invalid={!!errors.liveDemoLink}
                aria-describedby={errors.liveDemoLink ? "liveDemo-error" : undefined}
              />
              {errors.liveDemoLink && (
                <p id="liveDemo-error" className="mt-1 text-xs text-red-600">
                  {errors.liveDemoLink}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="comments" className="text-sm font-medium block">
                Comments
              </label>
              <textarea
                id="comments"
                name="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="mt-2 block w-full px-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#477BFF] text-base"
                placeholder="Any additional comments or notes..."
                rows={4}
                aria-invalid={!!errors.comments}
                aria-describedby={errors.comments ? "comments-error" : undefined}
              />
              {errors.comments && (
                <p id="comments-error" className="mt-1 text-xs text-red-600">
                  {errors.comments}
                </p>
              )}
            </div>

            {errors.form && (
              <div role="alert" className="text-sm text-red-600">
                {errors.form}
              </div>
            )}

            <div className="flex items-center justify-between gap-4 pt-2">
              <AssessmentButton type="submit" submitting={submitting} />

              <div className="text-sm text-gray-500 dark:text-gray-300">All fields are required</div>
            </div>

            {/* Success message */}
            <div aria-live="polite">
              {success && successData && (
                <div className="mt-3 bg-green-50 text-green-800 px-4 py-3 rounded-md space-y-3">
                  <div className="flex items-center gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M20 6L9 17l-5-5" stroke="#065f46" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="text-sm">
                      {successData.message || "Assessment submitted successfully! We'll review it soon."}
                    </div>
                  </div>

                  <div className="text-xs md:text-sm text-green-900">
                    <div>
                      <span className="font-semibold">Email:</span> {successData.email}
                    </div>
                    <div>
                      <span className="font-semibold">GitHub Repository:</span> {successData.githubUrl}
                    </div>
                    <div>
                      <span className="font-semibold">Live Demo URL:</span> {successData.liveDemoUrl}
                    </div>
                    {successData.comments && (
                      <div>
                        <span className="font-semibold">Comments:</span> {successData.comments}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>

      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        Tip: (1.): Use a public GitHub repository or provide a link with necessary access.  
      </p>
      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        Tip: (2.): Provide a working live demo URL so reviewers can verify the assessment easily. 
      </p>
      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        Tip: (3.): Ensure your live demo is accessible without authentication for smooth review Or provide the link to view and access your given task/project.
      </p>
    </div>
    </div>
  );
}