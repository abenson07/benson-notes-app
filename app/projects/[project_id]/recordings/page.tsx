"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getRecordings, type Recording } from "@/lib/api";

function formatDateTime(s?: string) {
  if (!s) return "";
  try {
    return new Date(s).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return s;
  }
}

function preview(text?: string, maxLen = 80) {
  if (!text) return "";
  const t = text.replace(/\s+/g, " ").trim();
  return t.length <= maxLen ? t : t.slice(0, maxLen) + "…";
}

export default function RecordingsListPage() {
  const params = useParams();
  const projectId = params.project_id as string;
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!projectId) return;
    setLoading(true);
    getRecordings(projectId)
      .then(setRecordings)
      .catch(() => setRecordings([]))
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <main className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 flex min-h-[56px] items-center gap-2 border-b border-neutral-200 bg-white px-4 dark:border-neutral-700 dark:bg-neutral-900">
        <Link
          href={`/projects/${projectId}`}
          className="rounded p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          aria-label="Back"
        >
          ←
        </Link>
        <h1 className="text-lg font-semibold">Recordings</h1>
      </header>

      {loading ? (
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      ) : recordings.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-neutral-600 dark:text-neutral-400">
          <p>No recordings yet.</p>
          <p className="mt-2 text-sm">Upload one from the project page.</p>
          <Link
            href={`/projects/${projectId}`}
            className="mt-4 text-blue-600 underline"
          >
            Back to project
          </Link>
        </div>
      ) : (
        <ul className="flex-1 divide-y divide-neutral-200 dark:divide-neutral-700">
          {recordings.map((r) => (
            <li key={r.recording_id}>
              <Link
                href={`/projects/${projectId}/recordings/${r.recording_id}`}
                className="flex min-h-[72px] flex-col justify-center px-4 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    {formatDateTime(r.created_at)}
                  </span>
                  {r.status === "processing" && (
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                      Processing
                    </span>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-neutral-700 dark:text-neutral-300">
                  {preview(r.raw_transcript || r.summary)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
