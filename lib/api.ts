const BASE = process.env.NEXT_PUBLIC_N8N_BASE_URL || "";
const WEBHOOK = process.env.NEXT_PUBLIC_N8N_WEBHOOK_PATH || "webhook";

function url(path: string): string {
  const p = path.startsWith("/") ? path.slice(1) : path;
  return `${BASE}/${WEBHOOK}/${p}`;
}

export type Project = {
  project_id: string;
  title: string;
  title_locked?: boolean;
  description?: string;
  project_transcript?: string;
  project_summary?: string;
  recording_count?: number;
  created_at?: string;
  updated_at?: string;
};

export type Recording = {
  recording_id: string;
  project_id: string;
  raw_transcript?: string;
  summary?: string;
  status: "processing" | "done" | "error";
  created_at?: string;
};

export async function uploadRecording(
  file: File,
  projectId?: string
): Promise<{ recording_id: string; project_id: string }> {
  const form = new FormData();
  form.append("file", file);
  if (projectId) form.append("project_id", projectId);
  const res = await fetch(url("voice-upload"), {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || `Upload failed: ${res.status}`);
  }
  return res.json();
}

export async function getProjects(): Promise<Project[]> {
  const res = await fetch(url("projects"));
  if (!res.ok) throw new Error("Failed to load projects");
  const data = await res.json();
  return Array.isArray(data) ? data : data?.items ?? [];
}

export async function getProject(id: string): Promise<Project | null> {
  const res = await fetch(url(`projects/${encodeURIComponent(id)}`));
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load project");
  return res.json();
}

export async function getRecordings(projectId: string): Promise<Recording[]> {
  const res = await fetch(url(`projects/${encodeURIComponent(projectId)}/recordings`));
  if (!res.ok) throw new Error("Failed to load recordings");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function getRecording(
  projectId: string,
  recordingId: string
): Promise<Recording | null> {
  const res = await fetch(
    url(`projects/${encodeURIComponent(projectId)}/recordings/${encodeURIComponent(recordingId)}`)
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load recording");
  return res.json();
}

export async function updateProject(
  id: string,
  data: { title?: string; title_locked?: boolean; description?: string }
): Promise<Project> {
  const res = await fetch(url(`projects/${encodeURIComponent(id)}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ project_id: id, ...data }),
  });
  if (!res.ok) throw new Error("Failed to update project");
  return res.json();
}

export function pollRecordingStatus(
  projectId: string,
  recordingId: string
): Promise<"processing" | "done" | "error"> {
  return getRecording(projectId, recordingId).then((r) => (r?.status as "processing" | "done" | "error") || "processing");
}
