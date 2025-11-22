import React from 'react';

type Props = {
  type?: 'button' | 'submit' | 'reset';
  submitting?: boolean;
  children?: React.ReactNode;
  disabled?: boolean;
};

export default function AssessmentButton({
  type = 'submit',
  submitting = false,
  children = 'Submit',
}: Props) {
  return (
    <button
      type={type}
      disabled={submitting}
      className={`inline-flex items-center justify-center rounded-md px-5 py-2 text-white font-medium shadow-sm focus:outline-none ${
        submitting ? 'bg-[#8aa3ff] cursor-not-allowed' : 'bg-[#477BFF] hover:bg-[#356bff]'
      }`}
      style={{ borderRadius: 8 }}
      aria-disabled={submitting}
    >
      {submitting ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
}
