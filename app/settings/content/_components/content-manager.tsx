"use client";

import { useState, useEffect, useTransition } from "react";
import {
  addContentSource,
  syncContentSource,
  toggleContentSource,
  removeContentSource,
  setDisabledBooks,
} from "@/app/actions/content";
import type { ContentSource, ElementCounts, SourceMissEntry } from "@/app/actions/content";
import { expandAbbrev } from "@/lib/content/source-abbreviations";

const DISCLAIMER_KEY = "semper-content-disclaimer-seen";
const AURORA_DEFAULT_URL =
  "https://raw.githubusercontent.com/AuroraLegacy/elements/master/AuroraLegacy.index";

interface Props {
  initialSources: ContentSource[];
}

export function ContentManager({ initialSources }: Props) {
  const [sources, setSources] = useState(initialSources);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [labelInput, setLabelInput] = useState("Aurora Legacy");
  const [urlInput, setUrlInput] = useState(AURORA_DEFAULT_URL);
  const [addError, setAddError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [expandedMissesId, setExpandedMissesId] = useState<string | null>(null);
  const [expandedBooksId, setExpandedBooksId] = useState<string | null>(null);

  useEffect(() => {
    if (!localStorage.getItem(DISCLAIMER_KEY)) {
      setShowDisclaimer(true);
    }
  }, []);

  function dismissDisclaimer() {
    localStorage.setItem(DISCLAIMER_KEY, "1");
    setShowDisclaimer(false);
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!labelInput.trim() || !urlInput.trim()) return;
    setAddError("");
    startTransition(async () => {
      try {
        const source = await addContentSource(labelInput, urlInput);
        setSources((prev) => [...prev, source]);
        setLabelInput("");
        setUrlInput("");
      } catch (err) {
        setAddError(err instanceof Error ? err.message : "Sync failed");
      }
    });
  }

  function handleSync(sourceId: string) {
    setSyncingId(sourceId);
    startTransition(async () => {
      try {
        const { lastSyncedAt, counts, sourceMisses, books } = await syncContentSource(sourceId);
        setSources((prev) =>
          prev.map((s) =>
            s.id === sourceId
              ? { ...s, lastSyncedAt, spellCount: counts.spells, elementCounts: counts as ElementCounts, sourceMisses, books }
              : s
          )
        );
      } finally {
        setSyncingId(null);
      }
    });
  }

  function handleToggleBook(sourceId: string, book: string, currentDisabled: string[]) {
    const next = currentDisabled.includes(book)
      ? currentDisabled.filter((b) => b !== book)
      : [...currentDisabled, book];
    setSources((prev) =>
      prev.map((s) => (s.id === sourceId ? { ...s, disabledBooks: next } : s))
    );
    startTransition(async () => {
      await setDisabledBooks(sourceId, next);
    });
  }

  function handleToggle(sourceId: string, enabled: boolean) {
    setSources((prev) =>
      prev.map((s) => (s.id === sourceId ? { ...s, enabled } : s))
    );
    startTransition(async () => {
      await toggleContentSource(sourceId, enabled);
    });
  }

  function handleRemove(sourceId: string) {
    setConfirmRemoveId(sourceId);
  }

  function handleConfirmRemove() {
    const sourceId = confirmRemoveId;
    if (!sourceId) return;
    setConfirmRemoveId(null);
    setRemovingId(sourceId);
    startTransition(async () => {
      try {
        await removeContentSource(sourceId);
        setSources((prev) => prev.filter((s) => s.id !== sourceId));
      } finally {
        setRemovingId(null);
      }
    });
  }

  return (
    <>
      {/* Disclaimer modal */}
      {showDisclaimer && (
        <>
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
          <div
            role="dialog"
            aria-modal
            aria-label="Content import disclaimer"
            className="fixed inset-x-0 bottom-0 z-50 bg-stone-900 border-t border-stone-700 rounded-t-2xl px-6 py-6
              md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
              md:w-[min(480px,92vw)] md:rounded-2xl md:border md:border-stone-700"
          >
            <h2 className="text-base font-bold text-stone-100 mb-3">
              Before you import content
            </h2>
            <p className="text-sm text-stone-300 leading-relaxed mb-3">
              Only import content for products you own. Importing copyrighted
              material without owning it may violate the publisher&apos;s terms.
            </p>
            <p className="text-sm text-stone-400 leading-relaxed mb-6">
              Aurora Legacy is a community-maintained project and is{" "}
              <strong className="text-stone-300">not affiliated with</strong>{" "}
              Wizards of the Coast or the official D&amp;D 5e products.
            </p>
            <button
              onClick={dismissDisclaimer}
              className="w-full min-h-[48px] rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold transition-colors"
            >
              I understand — continue
            </button>
          </div>
        </>
      )}

      {/* Add source form */}
      <section className="bg-stone-900 rounded-xl border border-stone-800 p-5 mb-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-stone-500 mb-4">
          Add Content Source
        </h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <div>
            <label className="block text-xs text-stone-400 mb-1">Label</label>
            <input
              type="text"
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              placeholder="e.g. Aurora Legacy"
              disabled={isPending}
              className="w-full min-h-[44px] rounded-lg bg-stone-800 border border-stone-700 px-3 text-stone-100 text-sm
                focus:outline-none focus:border-amber-500 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs text-stone-400 mb-1">Index URL</label>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder={AURORA_DEFAULT_URL}
              disabled={isPending}
              className="w-full min-h-[44px] rounded-lg bg-stone-800 border border-stone-700 px-3 text-stone-100 text-sm
                focus:outline-none focus:border-amber-500 disabled:opacity-50"
            />
          </div>

          {addError && (
            <p className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
              {addError}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending || !labelInput.trim() || !urlInput.trim()}
            className="w-full min-h-[48px] rounded-xl bg-amber-600 hover:bg-amber-500 active:bg-amber-700
              text-stone-950 font-bold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending && !syncingId && !removingId
              ? "Syncing… this may take a minute"
              : "Add & Sync"}
          </button>
        </form>
      </section>

      {/* Source list */}
      {sources.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-stone-500 mb-3">
            Your Sources
          </h2>
          <ul className="space-y-3">
            {sources.map((source) => (
              <li
                key={source.id}
                className="bg-stone-900 rounded-xl border border-stone-800 p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-stone-100 truncate">
                      {source.label}
                    </p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {source.elementCounts
                        ? [
                            source.elementCounts.spells   > 0 && `${source.elementCounts.spells} spells`,
                            source.elementCounts.races     > 0 && `${source.elementCounts.races} races`,
                            source.elementCounts.classes   > 0 && `${source.elementCounts.classes} classes`,
                            source.elementCounts.items     > 0 && `${source.elementCounts.items} items`,
                            source.elementCounts.feats     > 0 && `${source.elementCounts.feats} feats`,
                          ].filter(Boolean).join(" · ")
                        : `${source.spellCount} spells`}
                      {source.lastSyncedAt &&
                        ` · synced ${new Date(source.lastSyncedAt).toLocaleDateString()}`}
                    </p>
                  </div>

                  {/* Enable / disable toggle */}
                  <label className="shrink-0 relative inline-flex cursor-pointer">
                    <input
                      type="checkbox"
                      checked={source.enabled}
                      onChange={() => handleToggle(source.id, !source.enabled)}
                      aria-label={source.enabled ? "Disable source" : "Enable source"}
                      className="sr-only peer"
                    />
                    <div
                      className={`w-11 h-7 rounded-full transition-colors relative
                        peer-focus-visible:ring-2 peer-focus-visible:ring-amber-400
                        peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-stone-900
                        ${source.enabled ? "bg-amber-600" : "bg-stone-700"}`}
                    >
                      <span
                        className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          source.enabled ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </div>
                  </label>
                </div>

                <p className="text-xs text-stone-600 truncate mb-3">
                  {source.indexUrl}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleSync(source.id)}
                    disabled={isPending}
                    className="flex-1 min-h-[40px] rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs
                      font-semibold transition-colors disabled:opacity-40"
                  >
                    {syncingId === source.id ? "Syncing…" : "Re-sync"}
                  </button>
                  <button
                    onClick={() => handleRemove(source.id)}
                    disabled={isPending}
                    className="min-h-[40px] px-4 rounded-lg border border-stone-700 hover:border-red-700
                      text-stone-500 hover:text-red-400 text-xs font-semibold transition-colors disabled:opacity-40"
                  >
                    {removingId === source.id ? "Removing…" : "Remove"}
                  </button>
                </div>

                {/* Per-book toggles — only shown after a sync populates books */}
                {source.books.length > 0 && (
                  <div className="mt-3 border-t border-stone-800 pt-3">
                    <button
                      onClick={() =>
                        setExpandedBooksId(
                          expandedBooksId === source.id ? null : source.id
                        )
                      }
                      className="text-xs text-stone-400 hover:text-stone-200 transition-colors"
                    >
                      {expandedBooksId === source.id ? "▲" : "▼"}{" "}
                      Books ({source.books.length - source.disabledBooks.length}/{source.books.length} enabled)
                    </button>
                    {expandedBooksId === source.id && (
                      <ul className="mt-3 space-y-2">
                        {[...source.books]
                          .sort((a, b) => expandAbbrev(a).localeCompare(expandAbbrev(b)))
                          .map((book) => {
                          const fullName = expandAbbrev(book);
                          const label = fullName !== book ? `${fullName} (${book})` : book;
                          const enabled = !source.disabledBooks.includes(book);
                          return (
                            <li key={book} className="flex items-center justify-between gap-3">
                              <span className="text-xs text-stone-300">{label}</span>
                              <label className="shrink-0 relative inline-flex cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={enabled}
                                  onChange={() =>
                                    handleToggleBook(source.id, book, source.disabledBooks)
                                  }
                                  aria-label={enabled ? `Disable ${book}` : `Enable ${book}`}
                                  className="sr-only peer"
                                />
                                <div
                                  className={`w-9 h-5 rounded-full transition-colors relative
                                    peer-focus-visible:ring-2 peer-focus-visible:ring-amber-400
                                    peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-stone-900
                                    ${enabled ? "bg-amber-600" : "bg-stone-700"}`}
                                >
                                  <span
                                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                                      enabled ? "translate-x-4" : "translate-x-0.5"
                                    }`}
                                  />
                                </div>
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}

                {/* Source miss diagnostic — only shown after a sync populates data */}
                {source.sourceMisses.length > 0 && (
                  <div className="mt-3 border-t border-stone-800 pt-3">
                    <button
                      onClick={() =>
                        setExpandedMissesId(
                          expandedMissesId === source.id ? null : source.id
                        )
                      }
                      className="text-xs text-amber-500/70 hover:text-amber-400 transition-colors"
                    >
                      {expandedMissesId === source.id ? "▲" : "▼"}{" "}
                      {source.sourceMisses.length} unrecognized book name
                      {source.sourceMisses.length !== 1 ? "s" : ""} — re-sync
                      after adding to source-abbreviations.ts
                    </button>
                    {expandedMissesId === source.id && (
                      <SourceMissTable misses={source.sourceMisses} />
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {sources.length === 0 && (
        <p className="text-sm text-stone-500 text-center py-8">
          No content sources yet. Add one above to import additional spells.
        </p>
      )}

      {/* Remove confirmation dialog */}
      {confirmRemoveId && (() => {
        const target = sources.find((s) => s.id === confirmRemoveId);
        return target ? (
          <>
            <div
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              onClick={() => setConfirmRemoveId(null)}
            />
            <div
              role="dialog"
              aria-modal
              aria-label="Confirm source removal"
              className="fixed inset-x-0 bottom-0 z-50 bg-stone-900 border-t border-stone-700 rounded-t-2xl px-6 py-6
                md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
                md:w-[min(400px,92vw)] md:rounded-2xl md:border md:border-stone-700"
            >
              <h2 className="text-base font-bold text-stone-100 mb-2">Remove source?</h2>
              <p className="text-sm text-stone-400 mb-6">
                <span className="text-stone-200 font-medium">{target.label}</span> and all its
                imported content will be removed. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmRemoveId(null)}
                  className="flex-1 min-h-[48px] rounded-xl border border-stone-700 text-stone-300
                    hover:border-stone-500 hover:text-stone-100 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRemove}
                  className="flex-1 min-h-[48px] rounded-xl bg-red-700 hover:bg-red-600
                    text-white text-sm font-bold transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </>
        ) : null;
      })()}
    </>
  );
}

function SourceMissTable({ misses }: { misses: SourceMissEntry[] }) {
  return (
    <table className="mt-2 w-full text-xs border-collapse">
      <thead>
        <tr className="text-left text-stone-500">
          <th className="pb-1 pr-3 font-medium">Book name in Aurora</th>
          <th className="pb-1 pr-3 font-medium">Auto abbrev</th>
          <th className="pb-1 font-medium text-right">Elements</th>
        </tr>
      </thead>
      <tbody>
        {misses.map((m) => (
          <tr key={m.source} className="border-t border-stone-800">
            <td className="py-1 pr-3 text-stone-300 font-mono">{m.source}</td>
            <td className="py-1 pr-3 text-amber-400 font-mono">{m.abbrev}</td>
            <td className="py-1 text-stone-500 text-right tabular-nums">{m.count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
