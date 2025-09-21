"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, Home } from "lucide-react";

export default function AuthCodeError() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br  p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-gray-800/20 p-8 shadow-2xl backdrop-blur-sm border border-gray-700/50">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">
            Authentication Error
          </h2>
          <p className="text-gray-300">
            There was an error processing your email verification link.
          </p>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg bg-red-900/20 p-4 border border-red-800">
            <div className="text-sm text-red-300">
              <p className="mb-2">This could happen if:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>The verification link has expired</li>
                <li>The link has already been used</li>
                <li>The link is invalid or corrupted</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => router.push("/login")}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Try Signing In Again
            </button>

            <button
              onClick={() => router.push("/")}
              className="w-full flex items-center justify-center py-3 px-4 border border-gray-600 text-sm font-medium rounded-lg text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
