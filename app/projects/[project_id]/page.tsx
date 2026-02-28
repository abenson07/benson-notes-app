"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getProject, getRecordings, updateProject, type Project } from "@/lib/api";
import UploadSheet from "@/components/UploadSheet/UploadSheet";
import TabView from "@/components/TabView/TabView";
import SearchBar from "@/components/SearchBar/SearchBar";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.project_id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [hasProcessing, setHasProcessing] = useState(false);

  const load = useCallback(() => {
    if (!projectId) return;
    setLoading(true);
    Promise.all([getProject(projectId), getRecordings(projectId)])
      .then(([p, recordings]) => {
        setProject(p || null);
        setHasProcessing(recordings.some((r) => r.status === "processing"));
      })
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleTitleBlur = (newTitle: string) => {
    if (!project || project.title_locked || newTitle === project.title) return;
    updateProject(projectId, { title: newTitle, title_locked: true })
      .then(setProject)
      .catch(() => {});
  };

  const handleDescriptionBlur = (newDesc: string) => {
    if (!project || newDesc === (project.description ?? "")) return;
    updateProject(projectId, { description: newDesc })
      .then(setProject)
      .catch(() => {});
  };

  const handleUploadSuccess = (_projectId: string, recordingId: string) => {
    load();
    router.push(`/projects/${projectId}/recordings/${recordingId}`);
  };

  if (loading && !project) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!project) {
    return (
      <main className="p-4">
        <p>Project not found.</p>
        <Link href="/" className="text-blue-600 underline">
          Back to home
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
        <div className="flex min-h-[56px] items-center gap-2 px-4">
          <Link
            href="/"
            className="rounded p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
            aria-label="Back"
          >
            ←
          </Link>
          <div className="flex-1 min-w-0">
            {project.title_locked ? (
              <span className="block truncate font-medium">{project.title || "Untitled"}</span>
            ) : (
              <input
                type="text"
                defaultValue={project.title || "Untitled"}
                onBlur={(e) => handleTitleBlur(e.target.value)}
                className="w-full truncate rounded bg-transparent font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            )}
          </div>
          {project.title_locked && (
            <span className="text-neutral-400" title="Title locked">🔒</span>
          )}
        </div>
        <div className="px-4 pb-2">
          <input
            type="text"
            placeholder="Add description…"
            defaultValue={project.description ?? ""}
            onBlur={(e) => handleDescriptionBlur(e.target.value)}
            className="w-full rounded border-0 bg-transparent text-sm text-neutral-600 placeholder-neutral-400 focus:outline-none dark:text-neutral-400"
          />
        </div>
        {hasProcessing && (
          <div className="bg-amber-100 px-4 py-2 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
            Processing new recording…
          </div>
        )}
      </header>

      <div className="flex flex-1 flex-col min-h-0">
        <div className="shrink-0 px-4 pt-2">
          <SearchBar onSearch={setSearch} placeholder="Search in summary or transcript…" />
        </div>
        <div className="flex-1 min-h-0">
          <TabView
            summaryContent={project.project_summary ?? ""}
            transcriptContent={project.project_transcript ?? ""}
            searchHighlight={search}
          />
        </div>
      </div>

      <nav className="flex min-h-[64px] items-center justify-center gap-8 border-t border-neutral-200 bg-white px-4 dark:border-neutral-700 dark:bg-neutral-900 safe-area-pb">
        <Link
          href={`/projects/${projectId}/recordings`}
          className="flex flex-col items-center gap-1 text-neutral-600 dark:text-neutral-400"
        >
          <span className="text-xl">📋</span>
          <span className="text-xs">Recordings</span>
        </Link>
        <button
          type="button"
          onClick={() => setUploadOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700"
          aria-label="Upload"
        >
          +
        </button>
        <div className="w-16" />
      </nav>

      <UploadSheet
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        projectId={projectId}
        onSuccess={handleUploadSuccess}
      />
    </main>
  );
}
