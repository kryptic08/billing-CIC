"use client";
import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br">
      <div className="text-center px-4 sm:px-6 lg:px-8">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-8xl sm:text-9xl font-bold text-gray-200 dark:text-gray-700 select-none">
            404
          </h1>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Page Not Found
            <span>
              <span className="ml-2">—well not yet.</span>
            </span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-md mx-auto">
            The page you are looking for might have been removed, had its name
            changed, or is not yet implemented, sorry about that.
            nuginagawamukasiditopar, uwi ka na
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="group inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Home className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Go Home
          </Link>
        </div>

        {/* Decorative Element */}
        <div className="mt-12 opacity-50">
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 via-yellow-400 to-yellow-200 mx-auto rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
