"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getRecording, type Recording } from "@/lib/api";
import TabView from "@/components/TabView/TabView";
import SearchBar from "@/components/SearchBar/SearchBar";

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

export default function RecordingDetailPage() {
  const params = useParams();
  const projectId = params.project_id as string;
  const recordingId = params.recording_id as string;
  const [recording, setRecording] = useState<Recording | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!projectId || !recordingId) return;
    getRecording(projectId, recordingId)
      .then(setRecording)
      .catch(() => setRecording(null))
      .finally(() => setLoading(false));
  }, [projectId, recordingId]);

  if (loading && !recording) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!recording) {
    return (
      <main className="p-4">
        <p>Recording not found.</p>
        <Link href={`/projects/${projectId}/recordings`} className="text-blue-600 underline">
          Back to recordings
        </Link>
      </main>
    );
  }

  const isProcessing = recording.status === "processing";

  return (
    <main className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex min-h-[56px] items-center gap-2 border-b border-neutral-200 bg-white px-4 dark:border-neutral-700 dark:bg-neutral-900">
        <Link
          href={`/projects/${projectId}/recordings`}
          className="rounded p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          aria-label="Back"
        >
          ←
        </Link>
        <h1 className="truncate text-lg font-semibold">
          {formatDateTime(recording.created_at)}
        </h1>
      </header>

      <div className="flex flex-1 flex-col min-h-0">
        <div className="shrink-0 px-4 pt-2">
          <SearchBar onSearch={setSearch} placeholder="Search…" />
        </div>
        <div className="flex-1 min-h-0">
          {isProcessing ? (
            <div className="flex flex-1 items-center justify-center p-8 text-neutral-500 dark:text-neutral-400">
              <div className="text-center">
                <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                <p>Transcribing your recording…</p>
              </div>
            </div>
          ) : (
            <TabView
              summaryContent={recording.summary ?? ""}
              transcriptContent={recording.raw_transcript ?? ""}
              searchHighlight={search}
              summaryPlaceholder="No summary."
              transcriptPlaceholder="No transcript."
            />
          )}
        </div>
      </div>
    </main>
  );
}
