"use client";

import { useState, useCallback } from "react";
import { uploadRecording, pollRecordingStatus } from "@/lib/api";

const ACCEPT = ".mp3,.m4a,.wav,.webm,.ogg";
const MAX_MB = 25;
const MAX_BYTES = MAX_MB * 1024 * 1024;

type Step = "idle" | "uploading" | "transcribing" | "summarizing" | "done" | "error";

type Props = {
  open: boolean;
  onClose: () => void;
  projectId?: string;
  onSuccess?: (projectId: string, recordingId: string) => void;
};

export default function UploadSheet({ open, onClose, projectId, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("idle");
  const [polling, setPolling] = useState(false);

  const validate = useCallback((f: File): string | null => {
    const ext = f.name.split(".").pop()?.toLowerCase();
    const allowed = ["mp3", "m4a", "wav", "webm", "ogg"];
    if (!ext || !allowed.includes(ext)) return "Accepted: mp3, m4a, wav, webm, ogg";
    if (f.size > MAX_BYTES) return `Max size ${MAX_MB}MB`;
    return null;
  }, []);

  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) return;
      const err = validate(f);
      setError(err);
      setFile(err ? null : f);
      setStep("idle");
    },
    [validate]
  );

  const handleSubmit = useCallback(async () => {
    if (!file) return;
    setError(null);
    setStep("uploading");
    try {
      const { recording_id, project_id } = await uploadRecording(file, projectId);
      setStep("transcribing");
      setPolling(true);
      const poll = async () => {
        const status = await pollRecordingStatus(project_id, recording_id);
        if (status === "processing") {
          setStep("transcribing");
          setTimeout(poll, 2500);
          return;
        }
        if (status === "done") {
          setStep("done");
          setPolling(false);
          setTimeout(() => {
            onSuccess?.(project_id, recording_id);
            onClose();
            setFile(null);
            setStep("idle");
          }, 800);
          return;
        }
        if (status === "error") {
          setStep("error");
          setError("Processing failed");
          setPolling(false);
          return;
        }
        setStep("summarizing");
        setTimeout(poll, 2500);
      };
      setTimeout(poll, 2500);
    } catch (e) {
      setStep("error");
      setError(e instanceof Error ? e.message : "Upload failed");
    }
  }, [file, projectId, onSuccess, onClose]);

  const handleClose = useCallback(() => {
    if (!polling) {
      onClose();
      setFile(null);
      setError(null);
      setStep("idle");
    }
  }, [polling, onClose]);

  if (!open) return null;

  const stepLabel =
    step === "uploading"
      ? "Uploading…"
      : step === "transcribing"
        ? "Transcribing…"
        : step === "summarizing"
          ? "Generating summary…"
          : step === "done"
            ? "Done ✓"
            : step === "error"
              ? "Error"
              : "";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div
        className="w-full max-w-md rounded-t-2xl bg-white p-6 shadow-xl dark:bg-neutral-900 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Upload Recording</h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={polling}
            className="rounded p-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {step === "idle" || step === "error" ? (
          <>
            <label className="mb-2 block text-sm text-neutral-600 dark:text-neutral-400">
              Accepted: mp3, m4a, wav, webm, ogg — max {MAX_MB}MB
            </label>
            <div className="mb-4 flex flex-col gap-2">
              <input
                type="file"
                accept={ACCEPT}
                onChange={handleFile}
                className="block w-full text-sm text-neutral-700 file:mr-4 file:rounded file:border-0 file:bg-neutral-200 file:px-4 file:py-2 file:text-sm dark:file:bg-neutral-700 dark:text-neutral-300"
              />
              {file && (
                <div className="flex items-center justify-between rounded-lg bg-neutral-100 px-3 py-2 dark:bg-neutral-800">
                  <span className="truncate text-sm">{file.name}</span>
                  <span className="text-xs text-neutral-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                  {!polling && (
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="ml-2 text-neutral-500 hover:text-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
            </div>
            {error && (
              <p className="mb-4 text-sm text-red-600 dark:text-red-400" role="alert">
                {error}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-lg border border-neutral-300 py-2 dark:border-neutral-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!file || !!validate(file!)}
                className="flex-1 rounded-lg bg-blue-600 py-2 text-white disabled:opacity-50"
              >
                Upload & Transcribe
              </button>
            </div>
            {step === "error" && error && (
              <button
                type="button"
                onClick={() => setStep("idle")}
                className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-white"
              >
                Retry
              </button>
            )}
          </>
        ) : (
          <div className="py-4 text-center">
            {step === "done" ? (
              <p className="text-green-600 dark:text-green-400">{stepLabel}</p>
            ) : (
              <>
                <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                <p className="text-neutral-600 dark:text-neutral-400">{stepLabel}</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
