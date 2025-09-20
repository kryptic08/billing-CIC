"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  minHeight?: number;
  maxHeight?: number;
}

const useAutoResizeTextarea = ({
  minHeight = 48,
  maxHeight = 164,
}: {
  minHeight?: number;
  maxHeight?: number;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = `${minHeight}px`;
    const newHeight = Math.max(
      minHeight,
      Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY)
    );
    textarea.style.height = `${newHeight}px`;
  }, [minHeight, maxHeight]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${minHeight}px`;
      textarea.addEventListener("input", adjustHeight);
    }
    return () => {
      if (textarea) {
        textarea.removeEventListener("input", adjustHeight);
      }
    };
  }, [minHeight, adjustHeight]);

  return { textareaRef, adjustHeight };
};

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ minHeight = 48, maxHeight = 164, className, ...props }, ref) => {
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
      minHeight,
      maxHeight,
    });

    const handleRef = (element: HTMLTextAreaElement) => {
      textareaRef.current = element;
      if (typeof ref === "function") {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    };

    return (
      <textarea
        ref={handleRef}
        className={cn(
          "w-full max-w-none rounded-2xl px-4 py-3 bg-gray-100 dark:bg-gray-800",
          "border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white resize-none focus-visible:ring-0",
          "leading-[1.2] transition-all duration-200",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
