"use client";

import { useEffect } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

/**
 * Global Error Component
 *
 * This component handles errors that occur in the root layout.
 * It must define its own <html> and <body> tags.
 *
 * @param {Object} props - Component props
 * @param {Error} props.error - The error that occurred
 * @param {Function} props.reset - Function to retry
 * @returns {JSX.Element} The global error page
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{ margin: 0, padding: 0, fontFamily: "system-ui, sans-serif" }}
      >
        <div
          style={{
            minHeight: "100vh",
            background:
              "linear-gradient(135deg, #FAF3EA 0%, #ffffff 50%, #F5EDE0 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            style={{
              maxWidth: "600px",
              width: "100%",
              textAlign: "center",
              background: "rgba(255, 255, 255, 0.9)",
              padding: "3rem 2rem",
              borderRadius: "1.5rem",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
            }}
          >
            {/* Error Icon */}
            <div
              style={{
                width: "80px",
                height: "80px",
                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 2rem",
                boxShadow: "0 10px 30px rgba(239, 68, 68, 0.3)",
              }}
            >
              <AlertTriangle size={40} color="white" strokeWidth={2} />
            </div>

            {/* Error Title */}
            <h1
              style={{
                fontSize: "2.5rem",
                fontWeight: "bold",
                color: "#1f2937",
                marginBottom: "1rem",
              }}
            >
              Critical Error
            </h1>

            <p
              style={{
                fontSize: "1.125rem",
                color: "#6b7280",
                marginBottom: "0.5rem",
              }}
            >
              We encountered a critical error while loading the application.
            </p>

            <p
              style={{
                fontSize: "1rem",
                color: "#9ca3af",
                marginBottom: "2rem",
              }}
            >
              Please try refreshing the page or contact support if the problem
              persists.
            </p>

            {/* Error Details (Development) */}
            {process.env.NODE_ENV === "development" && (
              <div
                style={{
                  padding: "1.5rem",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "0.75rem",
                  marginBottom: "2rem",
                  textAlign: "left",
                }}
              >
                <p
                  style={{
                    fontSize: "0.875rem",
                    fontFamily: "monospace",
                    color: "#7f1d1d",
                    wordBreak: "break-all",
                  }}
                >
                  <strong>Error:</strong> {error.message}
                </p>
                {error.digest && (
                  <p
                    style={{
                      fontSize: "0.75rem",
                      fontFamily: "monospace",
                      color: "#991b1b",
                      marginTop: "0.5rem",
                    }}
                  >
                    <strong>Digest:</strong> {error.digest}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                alignItems: "center",
              }}
            >
              {/* Retry Button */}
              <button
                onClick={reset}
                style={{
                  padding: "1rem 2rem",
                  background:
                    "linear-gradient(135deg, #8B7355 0%, #A0826D 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "9999px",
                  fontSize: "1.125rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  minWidth: "200px",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(139, 115, 85, 0.3)",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 20px rgba(139, 115, 85, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(139, 115, 85, 0.3)";
                }}
              >
                <RefreshCw size={20} />
                <span>Try Again</span>
              </button>

              {/* Home Button */}
              <a
                href="/"
                style={{
                  padding: "1rem 2rem",
                  background: "white",
                  color: "#1f2937",
                  border: "2px solid #8B7355",
                  borderRadius: "9999px",
                  fontSize: "1.125rem",
                  fontWeight: "600",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  gap: "0.75rem",
                  minWidth: "200px",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.background = "#FAF3EA";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.background = "white";
                }}
              >
                <Home size={20} />
                <span>Go Home</span>
              </a>
            </div>

            {/* Footer Message */}
            <p
              style={{
                marginTop: "2rem",
                fontSize: "0.875rem",
                color: "#9ca3af",
                fontStyle: "italic",
              }}
            >
              Rootcraft - We apologize for the inconvenience
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
