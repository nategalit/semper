"use client";

import { useState, useTransition, useOptimistic, useCallback } from "react";
import type { Character, CharacterData } from "@/lib/types/character";
import type { DerivedStats } from "@/lib/character/calc";
import type { SrdClass, SrdRace, SrdBackground, SrdSpell } from "@/lib/content/srd";
import type { FeatureEntry, FightingStyleEntry } from "@/app/actions/content";
import type { RollEntry } from "@/lib/types/roll";
import type { DisplaySpell } from "@/lib/types/spell";
import { SRD_SPELLS } from "@/lib/content/srd";
import type { LocalRollEntry } from "@/lib/types/roll";
import type { AddRollInput } from "@/app/actions/rolls";
import { addRoll } from "@/app/actions/rolls";
import { CharacterMutationContext } from "@/lib/character/mutation-context";
import { RollContext, toLocalRoll } from "@/lib/character/roll-context";
import { Header } from "./header";
import { TabShellDesktop } from "./tab-shell-desktop";
import { TabShellMobile } from "./tab-shell-mobile";
import { TabStats } from "./tabs/tab-stats";
import { TabActions } from "./tabs/tab-actions";
import { TabSpells } from "./tabs/tab-spells";
import { TabInventory } from "./tabs/tab-inventory";
import { TabFeatures } from "./tabs/tab-features";
import { TabDescription } from "./tabs/tab-description";
import { TabExtras } from "./tabs/tab-extras";
import type { TabId } from "./tab-config";
import { DiceRollerFab } from "./dice-roller-fab";
import { LevelUpPanel } from "./panels/level-up-panel";

interface Props {
  character: Character;
  derived: DerivedStats;
  srdClass: SrdClass | undefined;
  srdRace: SrdRace | undefined;
  srdBackground: SrdBackground | undefined;
  initialRolls: RollEntry[];
  importedSpells: DisplaySpell[];
  featureMap: Map<string, FeatureEntry>;
  importedFightingStyles: FightingStyleEntry[];
}

function srdToDisplay(s: SrdSpell): DisplaySpell {
  return { ...s, sourceLabel: "SRD" };
}

export function CharacterSheet({
  character,
  derived,
  srdClass,
  srdRace,
  srdBackground,
  initialRolls,
  importedSpells,
  featureMap,
  importedFightingStyles,
}: Props) {
  const allSpells: DisplaySpell[] = [
    ...SRD_SPELLS.map(srdToDisplay),
    ...importedSpells,
  ];
  // ── Tab navigation ─────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabId>("stats");
  const [moreOpen, setMoreOpen] = useState(false);
  const [levelUpOpen, setLevelUpOpen] = useState(false);

  // ── Optimistic character state ─────────────────────────────────────────────
  const [isPending, startTransition] = useTransition();
  const [optimisticCharacter, addOptimistic] = useOptimistic(
    character,
    (_state: Character, patch: Partial<CharacterData>): Character => ({
      ..._state,
      data: { ..._state.data, ...patch },
    })
  );

  const mutate = useCallback(
    (patch: Partial<CharacterData>, action: () => Promise<void>) => {
      startTransition(async () => {
        addOptimistic(patch);
        await action();
      });
    },
    // startTransition and addOptimistic are stable React hook references
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // ── Roll state ─────────────────────────────────────────────────────────────
  const [rolls, setRolls] = useState<LocalRollEntry[]>(() =>
    initialRolls.map(toLocalRoll)
  );

  const roll = useCallback(
    (input: AddRollInput & { characterId: string }) => {
      const tempId = crypto.randomUUID();
      const optimisticRoll: LocalRollEntry = {
        id: tempId,
        characterId: input.characterId,
        rolledAt: new Date().toISOString(),
        label: input.label,
        dice: input.dice,
        results: input.results,
        modifier: input.modifier,
        total: input.total,
        mode: input.mode,
        rollType: input.rollType,
        synced: false,
        syncError: false,
      };

      setRolls((prev) => [optimisticRoll, ...prev].slice(0, 50));

      addRoll(input.characterId, input)
        .then((savedId) => {
          setRolls((prev) =>
            prev.map((r) =>
              r.id === tempId ? { ...r, id: savedId, synced: true, syncError: false } : r
            )
          );
        })
        .catch(() => {
          setRolls((prev) =>
            prev.map((r) =>
              r.id === tempId ? { ...r, synced: false, syncError: true } : r
            )
          );
        });
    },
    []
  );

  const retryRoll = useCallback(
    (id: string) => {
      const target = rolls.find((r) => r.id === id);
      if (!target) return;

      setRolls((prev) =>
        prev.map((r) => (r.id === id ? { ...r, syncError: false } : r))
      );

      addRoll(target.characterId, {
        label: target.label,
        dice: target.dice,
        results: target.results,
        modifier: target.modifier,
        total: target.total,
        mode: target.mode,
        rollType: target.rollType,
      })
        .then((savedId) => {
          setRolls((prev) =>
            prev.map((r) =>
              r.id === id ? { ...r, id: savedId, synced: true, syncError: false } : r
            )
          );
        })
        .catch(() => {
          setRolls((prev) =>
            prev.map((r) => (r.id === id ? { ...r, syncError: true } : r))
          );
        });
    },
    [rolls]
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  const tabContent = (
    <>
      {activeTab === "stats"       && (
        <TabStats
          character={optimisticCharacter}
          derived={derived}
          srdClass={srdClass}
          srdBackground={srdBackground}
        />
      )}
      {activeTab === "actions"     && <TabActions derived={derived} srdClass={srdClass} />}
      {activeTab === "spells"      && <TabSpells derived={derived} srdClass={srdClass} allSpells={allSpells} />}
      {activeTab === "inventory"   && <TabInventory />}
      {activeTab === "features"    && (
        <TabFeatures
          srdClass={srdClass}
          srdRace={srdRace}
          srdBackground={srdBackground}
          featureMap={featureMap}
          importedFightingStyles={importedFightingStyles}
          onChangeLevelRequest={() => setLevelUpOpen(true)}
        />
      )}
      {activeTab === "description" && <TabDescription character={optimisticCharacter} />}
      {activeTab === "extras"      && <TabExtras srdClass={srdClass} derived={derived} />}
    </>
  );

  return (
    <CharacterMutationContext.Provider value={{ character: optimisticCharacter, mutate, isPending }}>
      <RollContext.Provider value={{ rolls, roll, retryRoll }}>
        <div className="flex flex-col min-h-screen">
          <Header
            character={optimisticCharacter}
            derived={derived}
            onLevelTap={() => setLevelUpOpen(true)}
          />

          <TabShellDesktop activeTab={activeTab} onTabChange={setActiveTab} />

          <main className="flex-1 px-4 py-4 pb-24 md:pb-6 max-w-4xl mx-auto w-full">
            {tabContent}
          </main>

          <DiceRollerFab />

          <LevelUpPanel
            open={levelUpOpen}
            onClose={() => setLevelUpOpen(false)}
            srdClass={srdClass}
          />

          <TabShellMobile
            activeTab={activeTab}
            onTabChange={(tab) => { setActiveTab(tab); setMoreOpen(false); }}
            moreOpen={moreOpen}
            onMoreToggle={() => setMoreOpen((o) => !o)}
            onMoreTabChange={(tab) => { setActiveTab(tab); setMoreOpen(false); }}
          />
        </div>
      </RollContext.Provider>
    </CharacterMutationContext.Provider>
  );
}
