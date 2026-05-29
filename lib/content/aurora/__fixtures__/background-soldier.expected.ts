import type { BackgroundElement } from "../../schema";

export const SOLDIER: BackgroundElement = {
  elementType: "Background",
  id: "ID_BACKGROUND_SOLDIER",
  name: "Soldier",
  source: "Player's Handbook",
  sourceType: "imported",
  description: `<p>War has been your life for as long as you care to remember...</p>...`,
  sheetText: "", // no <sheet> element
  shortDescription: "Athletics, Intimidation, Gaming Set, Vehicles (Land)",
  rules: {
    statModifiers: [],
    grants: [
      { type: "Proficiency",          id: "ID_PROFICIENCY_SKILL_ATHLETICS",              name: "Athletics" },
      { type: "Proficiency",          id: "ID_PROFICIENCY_SKILL_INTIMIDATION",            name: "Intimidation" },
      { type: "Proficiency",          id: "ID_PROFICIENCY_TOOL_PROFICIENCY_VEHICLES_LAND", name: "vehicles (land)" },
      { type: "Background Feature",   id: "ID_BACKGROUND_FEATURE_MILITARY_RANK",         name: "Military Rank",
        requirements: "!ID_INTERNAL_GRANT_OPTIONAL_BACKGROUND_FEATURE" },
    ],
    choices: [
      // <select type="Proficiency" name="Gaming Set" supports="Gaming Set" />
      {
        kind: "element",
        type: "Proficiency",
        name: "Gaming Set",
        supports: "Gaming Set",
        number: 1,
      },
      // <select type="Background Feature" name="Variant Feature" supports="Optional Background Feature" optional="true" />
      {
        kind: "element",
        type: "Background Feature",
        name: "Variant Feature",
        supports: "Optional Background Feature",
        number: 1,
        optional: true,
      },
      // <select type="List"> nodes → ListSelectChoice
      {
        kind: "list",
        name: "Specialty",
        number: 1,
        optional: true,
        items: [
          { id: "1", text: "Officer" },
          { id: "2", text: "Scout" },
          { id: "3", text: "Infantry" },
          { id: "4", text: "Cavalry" },
          { id: "5", text: "Healer" },
          { id: "6", text: "Quartermaster" },
          { id: "7", text: "Standard bearer" },
          { id: "8", text: "Support staff (cook, blacksmith, or the like)" },
        ],
      },
      {
        kind: "list",
        name: "Personality Trait",
        number: 2,
        items: [
          { id: "1", text: "I'm always polite and respectful." },
          { id: "2", text: "I'm haunted by memories of war. I can't get the images of violence out of my mind." },
          { id: "3", text: "I've lost too many friends, and I'm slow to make new ones." },
          { id: "4", text: "I'm full of inspiring and cautionary tales from my military experience relevant to almost every combat situation" },
          { id: "5", text: "I can stare down a hell hound without flinching." },
          { id: "6", text: "I enjoy being strong and like breaking things." },
          { id: "7", text: "I have a crude sense of humor." },
          { id: "8", text: "I face problems head-on. A simple, direct solution is the best path to success." },
        ],
      },
      {
        kind: "list",
        name: "Ideal",
        number: 1,
        items: [
          { id: "1", text: "Greater Good. Our lot is to lay down our lives in defense of others. (Good)" },
          { id: "2", text: "Responsibility. I do what I must and obey just authority. (Lawful)" },
          { id: "3", text: "Independence. When people follow orders blindly, they embrace a kind of tyranny. (Chaotic)" },
          { id: "4", text: "Might. In life as in war, the stronger force wins. (Evil)" },
          { id: "5", text: "Live and Let Live. Ideals aren't worth killing over or going to war for. (Neutral)" },
          { id: "6", text: "Nation. My city, nation, or people are all that matter. (Any)" },
        ],
      },
      {
        kind: "list",
        name: "Bond",
        number: 1,
        items: [
          { id: "1", text: "I would still lay down my life for the people I served with." },
          { id: "2", text: "Someone saved my life on the battlefield. To this day, I will never leave a friend behind." },
          { id: "3", text: "My honor is my life." },
          { id: "4", text: "I'll never forget the crushing defeat my company suffered or the enemies who dealt it." },
          { id: "5", text: "Those who fight beside me are those worth dying for." },
          { id: "6", text: "I fight for those who cannot fight for themselves." },
        ],
      },
      {
        kind: "list",
        name: "Flaw",
        number: 1,
        items: [
          { id: "1", text: "The monstrous enemy we faced in battle still leaves me quivering with fear." },
          { id: "2", text: "I have little respect for anyone who is not a proven warrior." },
          { id: "3", text: "I made a terrible mistake in battle cost many lives— and I would do anything to keep that mistake secret." },
          { id: "4", text: "My hatred of my enemies is blind and unreasoning." },
          { id: "5", text: "I obey the law, even if the law causes misery." },
          { id: "6", text: "I'd rather eat my armor than admit when I'm wrong." },
        ],
      },
    ],
    extraRules: [],
  },
};
