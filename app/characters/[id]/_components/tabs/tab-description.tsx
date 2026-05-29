import type { Character } from "@/lib/types/character";
import { SectionCard } from "../shared/section-card";
import { EmptyState } from "../shared/empty-state";

interface Props {
  character: Character;
}

export function TabDescription({ character }: Props) {
  const { alignment, personalityTraits = [], ideal, bond, flaw } = character.data;

  return (
    <div className="space-y-4">
      {alignment && (
        <SectionCard title="Alignment">
          <p className="text-sm text-stone-200">{alignment}</p>
        </SectionCard>
      )}

      <SectionCard title="Personality Traits">
        {personalityTraits.length > 0 ? (
          <ul className="space-y-1">
            {personalityTraits.map((trait, i) => (
              <li key={i} className="text-sm text-stone-300">{trait}</li>
            ))}
          </ul>
        ) : (
          <EmptyState message="No personality traits." />
        )}
      </SectionCard>

      <SectionCard title="Ideal">
        {ideal ? (
          <p className="text-sm text-stone-300">{ideal}</p>
        ) : (
          <EmptyState message="No ideal." />
        )}
      </SectionCard>

      <SectionCard title="Bond">
        {bond ? (
          <p className="text-sm text-stone-300">{bond}</p>
        ) : (
          <EmptyState message="No bond." />
        )}
      </SectionCard>

      <SectionCard title="Flaw">
        {flaw ? (
          <p className="text-sm text-stone-300">{flaw}</p>
        ) : (
          <EmptyState message="No flaw." />
        )}
      </SectionCard>
    </div>
  );
}
