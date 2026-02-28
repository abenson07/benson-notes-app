"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getProjects, type Project } from "@/lib/api";
import UploadSheet from "@/components/UploadSheet/UploadSheet";

function formatDate(s?: string) {
  if (!s) return "";
  try {
    const d = new Date(s);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
  } catch {
    return s;
  }
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  const handleUploadSuccess = (projectId: string, recordingId: string) => {
    setProjects((prev) => {
      const has = prev.some((p) => p.project_id === projectId);
      if (has) return prev;
      return [{ project_id: projectId, title: "New Project", recording_count: 1 } as Project, ...prev];
    });
    router.push(`/projects/${projectId}/recordings/${recordingId}`);
  };

  return (
    <main className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/90">
        <h1 className="text-xl font-semibold">VoiceLog</h1>
      </header>

      {loading ? (
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
          <h2 className="text-2xl font-semibold">Upload Recording</h2>
          <p className="max-w-sm text-neutral-600 dark:text-neutral-400">
            Upload an audio file to create your first project.
          </p>
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-white shadow-lg hover:bg-blue-700"
          >
            <span className="text-2xl">↑</span>
            Upload Recording
          </button>
        </div>
      ) : (
        <>
          <ul className="flex-1 space-y-0 divide-y divide-neutral-200 dark:divide-neutral-700">
            {projects.map((p) => (
              <li key={p.project_id}>
                <Link
                  href={`/projects/${p.project_id}`}
                  className="flex min-h-[64px] flex-col justify-center px-4 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                >
                  <span className="font-medium">{p.title || "Untitled"}</span>
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    {formatDate(p.updated_at)} · {p.recording_count ?? 0} recordings
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="safe-area-pb fixed bottom-6 right-6">
            <button
              type="button"
              onClick={() => setUploadOpen(true)}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700"
              aria-label="Upload recording"
            >
              <span className="text-2xl">+</span>
            </button>
          </div>
        </>
      )}

      <UploadSheet
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </main>
  );
}
