"use client";

import { useState, useCallback } from "react";

type Props = {
  onSearch: (query: string) => void;
  placeholder?: string;
};

export default function SearchBar({
  onSearch,
  placeholder = "Search…",
}: Props) {
  const [value, setValue] = useState("");

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setValue(v);
      onSearch(v);
    },
    [onSearch]
  );

  const clear = useCallback(() => {
    setValue("");
    onSearch("");
  }, [onSearch]);

  return (
    <div className="relative flex items-center">
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-10 pr-10 text-sm dark:border-neutral-600 dark:bg-neutral-800"
        aria-label="Search"
      />
      <span className="pointer-events-none absolute left-3 text-neutral-400" aria-hidden>
        🔍
      </span>
      {value && (
        <button
          type="button"
          onClick={clear}
          className="absolute right-2 rounded p-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}
