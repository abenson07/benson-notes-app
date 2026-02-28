"use client";

import { useState } from "react";

type Tab = "summary" | "transcript";

type Props = {
  summaryContent: string;
  transcriptContent: string;
  searchHighlight?: string;
  summaryPlaceholder?: string;
  transcriptPlaceholder?: string;
};

export default function TabView({
  summaryContent,
  transcriptContent,
  searchHighlight,
  summaryPlaceholder = "No summary yet.",
  transcriptPlaceholder = "No transcript.",
}: Props) {
  const [tab, setTab] = useState<Tab>("summary");

  const highlight = (text: string) => {
    if (!searchHighlight?.trim()) return text;
    const re = new RegExp(`(${escapeRe(searchHighlight)})`, "gi");
    return text.replace(re, "<mark class='bg-yellow-200 dark:bg-yellow-800 rounded'>$1</mark>");
  };

  const summaryHtml = highlight(summaryContent || summaryPlaceholder);
  const transcriptHtml = highlight(transcriptContent || transcriptPlaceholder);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex border-b border-neutral-200 dark:border-neutral-700">
        <button
          type="button"
          onClick={() => setTab("summary")}
          className={`flex-1 py-3 text-sm font-medium ${
            tab === "summary"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-neutral-500 dark:text-neutral-400"
          }`}
        >
          Summary
        </button>
        <button
          type="button"
          onClick={() => setTab("transcript")}
          className={`flex-1 py-3 text-sm font-medium ${
            tab === "transcript"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-neutral-500 dark:text-neutral-400"
          }`}
        >
          Transcript
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {tab === "summary" && (
          <div
            className="prose prose-neutral dark:prose-invert max-w-none whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: summaryHtml }}
          />
        )}
        {tab === "transcript" && (
          <div
            className="prose prose-neutral dark:prose-invert max-w-none whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: transcriptHtml }}
          />
        )}
      </div>
    </div>
  );
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
