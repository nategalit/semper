import type { SrdSubclass } from "./types";

export const SRD_SUBCLASSES: SrdSubclass[] = [
  // ── Barbarian (L3) ────────────────────────────────────────────────────────
  {
    id: "ID_SUBCLASS_BARBARIAN_BERSERKER",
    classId: "ID_CLASS_BARBARIAN",
    name: "Path of the Berserker",
    description: "For Berserkers, rage is a means to an end — that end being violence. You can go into a frenzy when you rage, making additional melee weapon attacks as a bonus action.",
    features: ["Frenzy", "Mindless Rage", "Intimidating Presence", "Retaliation"],
  },
  {
    id: "ID_SUBCLASS_BARBARIAN_TOTEM",
    classId: "ID_CLASS_BARBARIAN",
    name: "Path of the Totem Warrior",
    description: "The Path of the Totem Warrior is a spiritual journey, as the barbarian accepts a spirit animal as guide, protector, and inspiration. You gain magical benefits based on your chosen totem animal.",
    features: ["Spirit Seeker", "Totem Spirit", "Aspect of the Beast", "Spirit Walker", "Totemic Attunement"],
  },

  // ── Bard (L3) ─────────────────────────────────────────────────────────────
  {
    id: "ID_SUBCLASS_BARD_LORE",
    classId: "ID_CLASS_BARD",
    name: "College of Lore",
    description: "Bards of the College of Lore know something about most things, collecting bits of knowledge from sources as diverse as scholarly tomes and peasant tales. They use their knowledge to inspire others or to demoralize foes.",
    features: ["Bonus Proficiencies", "Cutting Words", "Additional Magical Secrets", "Peerless Skill"],
  },
  {
    id: "ID_SUBCLASS_BARD_VALOR",
    classId: "ID_CLASS_BARD",
    name: "College of Valor",
    description: "Bards of the College of Valor are daring skalds whose tales keep alive the memory of the great heroes of the past. They sing the praises of those heroes and inspire a new generation to reach the same heights of glory.",
    features: ["Bonus Proficiencies", "Combat Inspiration", "Extra Attack", "Battle Magic"],
  },

  // ── Cleric (L1) ───────────────────────────────────────────────────────────
  {
    id: "ID_SUBCLASS_CLERIC_LIFE",
    classId: "ID_CLASS_CLERIC",
    name: "Life Domain",
    description: "The Life domain focuses on the vibrant positive energy — one of the fundamental forces of the universe — that sustains all life. Clerics who embrace this domain are exceptional healers.",
    features: ["Bonus Proficiency", "Disciple of Life", "Channel Divinity: Preserve Life", "Blessed Healer", "Divine Strike", "Supreme Healing"],
  },
  {
    id: "ID_SUBCLASS_CLERIC_LIGHT",
    classId: "ID_CLASS_CLERIC",
    name: "Light Domain",
    description: "Gods of light promote the ideals of rebirth and renewal, truth, vigilance, and beauty. Clerics of a god of light are enlightened souls infused with radiance.",
    features: ["Bonus Cantrip", "Warding Flare", "Channel Divinity: Radiance of the Dawn", "Improved Flare", "Potent Spellcasting", "Corona of Light"],
  },
  {
    id: "ID_SUBCLASS_CLERIC_KNOWLEDGE",
    classId: "ID_CLASS_CLERIC",
    name: "Knowledge Domain",
    description: "The gods of knowledge value learning and understanding above all. Clerics of these deities study esoteric lore, collect old tomes, and ponder the universe's secrets.",
    features: ["Blessings of Knowledge", "Channel Divinity: Knowledge of the Ages", "Channel Divinity: Read Thoughts", "Potent Spellcasting", "Visions of the Past"],
  },
  {
    id: "ID_SUBCLASS_CLERIC_NATURE",
    classId: "ID_CLASS_CLERIC",
    name: "Nature Domain",
    description: "Gods of nature are as varied as the natural world itself, from inscrutable gods of the deep forests to friendly deities associated with nature's abundance. Clerics of such gods wear their faith like a mantle.",
    features: ["Acolyte of Nature", "Bonus Proficiency", "Channel Divinity: Charm Animals and Plants", "Dampen Elements", "Divine Strike", "Master of Nature"],
  },
  {
    id: "ID_SUBCLASS_CLERIC_TEMPEST",
    classId: "ID_CLASS_CLERIC",
    name: "Tempest Domain",
    description: "Gods whose portfolios include the Tempest domain govern storms, sea, and sky. Clerics of these gods wear their faith like a mantle — powerful, dynamic, and potentially destructive.",
    features: ["Bonus Proficiencies", "Wrath of the Storm", "Channel Divinity: Destructive Wrath", "Thunderbolt Strike", "Divine Strike", "Stormborn"],
  },
  {
    id: "ID_SUBCLASS_CLERIC_TRICKERY",
    classId: "ID_CLASS_CLERIC",
    name: "Trickery Domain",
    description: "Gods of trickery are mischief-makers and instigators who stand as a constant challenge to the accepted order. Clerics of these gods are a disruptive force in the world.",
    features: ["Blessing of the Trickster", "Channel Divinity: Invoke Duplicity", "Channel Divinity: Cloak of Shadows", "Divine Strike", "Improved Duplicity"],
  },
  {
    id: "ID_SUBCLASS_CLERIC_WAR",
    classId: "ID_CLASS_CLERIC",
    name: "War Domain",
    description: "War has many manifestations. It can make heroes of ordinary people. The gods of war watch over warriors and reward them for their great deeds. Clerics of such gods excel in battle.",
    features: ["Bonus Proficiencies", "War Priest", "Channel Divinity: Guided Strike", "Channel Divinity: War God's Blessing", "Divine Strike", "Avatar of Battle"],
  },

  // ── Druid (L2) ────────────────────────────────────────────────────────────
  {
    id: "ID_SUBCLASS_DRUID_LAND",
    classId: "ID_CLASS_DRUID",
    name: "Circle of the Land",
    description: "The Circle of the Land is made up of mystics and sages who safeguard ancient knowledge and rites through a vast oral tradition. You gain bonus spells based on the terrain of your land.",
    features: ["Bonus Cantrip", "Natural Recovery", "Circle Spells", "Land's Stride", "Nature's Ward", "Nature's Sanctuary"],
  },
  {
    id: "ID_SUBCLASS_DRUID_MOON",
    classId: "ID_CLASS_DRUID",
    name: "Circle of the Moon",
    description: "Druids of the Circle of the Moon are fierce guardians of the wilds. Their order gathers under the full moon to share news and trade warnings. They master difficult beast shapes, including those with more powerful forms.",
    features: ["Combat Wild Shape", "Circle Forms", "Primal Strike", "Elemental Wild Shape", "Thousand Forms"],
  },

  // ── Fighter (L3) ──────────────────────────────────────────────────────────
  {
    id: "ID_SUBCLASS_FIGHTER_CHAMPION",
    classId: "ID_CLASS_FIGHTER",
    name: "Champion",
    description: "The archetypal Champion focuses on the development of raw physical power honed to deadly perfection. Those who model themselves on this archetype combine rigorous training with physical excellence.",
    features: ["Improved Critical", "Remarkable Athlete", "Additional Fighting Style", "Superior Critical", "Survivor"],
  },
  {
    id: "ID_SUBCLASS_FIGHTER_BATTLEMASTER",
    classId: "ID_CLASS_FIGHTER",
    name: "Battle Master",
    description: "Those who emulate the archetypal Battle Master employ martial techniques passed down through generations. They learn special maneuvers fueled by superiority dice.",
    features: ["Combat Superiority", "Student of War", "Know Your Enemy", "Improved Combat Superiority", "Relentless"],
  },
  {
    id: "ID_SUBCLASS_FIGHTER_ELDRITCH",
    classId: "ID_CLASS_FIGHTER",
    name: "Eldritch Knight",
    description: "The archetypal Eldritch Knight combines the martial mastery common to all fighters with a careful study of magic. Eldritch Knights use magical techniques similar to those practiced by wizards.",
    features: ["Spellcasting", "Weapon Bond", "War Magic", "Eldritch Strike", "Arcane Charge", "Improved War Magic"],
  },

  // ── Monk (L3) ─────────────────────────────────────────────────────────────
  {
    id: "ID_SUBCLASS_MONK_OPENHAND",
    classId: "ID_CLASS_MONK",
    name: "Way of the Open Hand",
    description: "Monks of the Way of the Open Hand are the ultimate masters of martial arts combat, whether armed or unarmed. They learn techniques to push and trip their opponents.",
    features: ["Open Hand Technique", "Wholeness of Body", "Tranquility", "Quivering Palm"],
  },
  {
    id: "ID_SUBCLASS_MONK_SHADOW",
    classId: "ID_CLASS_MONK",
    name: "Way of Shadow",
    description: "Monks of the Way of Shadow follow a tradition that values stealth and subterfuge. These monks might be called ninjas or shadowdancers, and they serve as spies and assassins.",
    features: ["Shadow Arts", "Shadow Step", "Cloak of Shadows", "Opportunist"],
  },
  {
    id: "ID_SUBCLASS_MONK_FOURELEMENTS",
    classId: "ID_CLASS_MONK",
    name: "Way of the Four Elements",
    description: "You follow a monastic tradition that teaches you to harness the elements. When you focus your ki, you can align yourself with the forces of creation and bend the four elements to your will.",
    features: ["Disciple of the Elements", "Elemental Disciplines"],
  },

  // ── Paladin (L3) ──────────────────────────────────────────────────────────
  {
    id: "ID_SUBCLASS_PALADIN_DEVOTION",
    classId: "ID_CLASS_PALADIN",
    name: "Oath of Devotion",
    description: "The Oath of Devotion binds a paladin to the loftiest ideals of justice, virtue, and order. Sometimes called cavaliers, white knights, or holy warriors, these paladins meet the ideal of the knight in shining armor.",
    features: ["Channel Divinity: Sacred Weapon", "Channel Divinity: Turn the Unholy", "Aura of Devotion", "Purity of Spirit", "Holy Nimbus"],
  },
  {
    id: "ID_SUBCLASS_PALADIN_ANCIENTS",
    classId: "ID_CLASS_PALADIN",
    name: "Oath of the Ancients",
    description: "The Oath of the Ancients is as old as the race of elves and the rituals of the druids. Sometimes called fey knights, green knights, or horned knights, paladins who swear this oath cast their lot with the side of the light.",
    features: ["Channel Divinity: Nature's Wrath", "Channel Divinity: Turn the Faithless", "Aura of Warding", "Undying Sentinel", "Elder Champion"],
  },
  {
    id: "ID_SUBCLASS_PALADIN_VENGEANCE",
    classId: "ID_CLASS_PALADIN",
    name: "Oath of Vengeance",
    description: "The Oath of Vengeance is a solemn commitment to punish those who have committed a grievous sin. These paladins — sometimes called avengers or dark knights — are willing to sacrifice even their own righteousness to mete out justice.",
    features: ["Channel Divinity: Abjure Enemy", "Channel Divinity: Vow of Enmity", "Relentless Avenger", "Soul of Vengeance", "Avenging Angel"],
  },

  // ── Ranger (L3) ───────────────────────────────────────────────────────────
  {
    id: "ID_SUBCLASS_RANGER_HUNTER",
    classId: "ID_CLASS_RANGER",
    name: "Hunter",
    description: "Emulating the Hunter archetype means accepting your place as a bulwark between civilization and the terrors of the wilderness. As you walk the Hunter's path, you learn specialized techniques for fighting the threats you face.",
    features: ["Hunter's Prey", "Defensive Tactics", "Multiattack", "Superior Hunter's Defense"],
  },
  {
    id: "ID_SUBCLASS_RANGER_BEASTMASTER",
    classId: "ID_CLASS_RANGER",
    name: "Beast Master",
    description: "The Beast Master archetype embodies a friendship between the civilized races and the beasts of the world. United in focus, beast and ranger work as one to fight the monstrous foes that threaten civilization and the wilderness alike.",
    features: ["Ranger's Companion", "Exceptional Training", "Bestial Fury", "Share Spells"],
  },

  // ── Rogue (L3) ────────────────────────────────────────────────────────────
  {
    id: "ID_SUBCLASS_ROGUE_THIEF",
    classId: "ID_CLASS_ROGUE",
    name: "Thief",
    description: "You hone your skills in the larcenous arts. Burglars, bandits, cutpurses, and other criminals typically follow this archetype, but so do rogues who prefer to think of themselves as professional treasure seekers.",
    features: ["Fast Hands", "Second-Story Work", "Supreme Sneak", "Use Magic Device", "Thief's Reflexes"],
  },
  {
    id: "ID_SUBCLASS_ROGUE_ASSASSIN",
    classId: "ID_CLASS_ROGUE",
    name: "Assassin",
    description: "You focus your training on the grim art of death. Those who adhere to this archetype are diverse — hired killers, spies, bounty hunters, and even specially anointed priests trained to eliminate foes of their deity.",
    features: ["Bonus Proficiencies", "Assassinate", "Infiltration Expertise", "Impostor", "Death Strike"],
  },
  {
    id: "ID_SUBCLASS_ROGUE_ARCANE",
    classId: "ID_CLASS_ROGUE",
    name: "Arcane Trickster",
    description: "Some rogues enhance their fine-honed skills of stealth and agility with magic, learning tricks of enchantment and illusion. These rogues include pickpockets and burglars, but also pranksters, mischief-makers, and a significant number of adventurers.",
    features: ["Spellcasting", "Mage Hand Legerdemain", "Magical Ambush", "Versatile Trickster", "Spell Thief"],
  },

  // ── Sorcerer (L1) ─────────────────────────────────────────────────────────
  {
    id: "ID_SUBCLASS_SORCERER_DRACONIC",
    classId: "ID_CLASS_SORCERER",
    name: "Draconic Bloodline",
    description: "Your innate magic comes from draconic magic that was mingled with your blood or that of your ancestors. Most often, sorcerers with this origin trace their descent back to a mighty sorcerer of ancient times who made a bargain with a dragon.",
    features: ["Dragon Ancestor", "Draconic Resilience", "Elemental Affinity", "Dragon Wings", "Draconic Presence"],
  },
  {
    id: "ID_SUBCLASS_SORCERER_WILDMAGIC",
    classId: "ID_CLASS_SORCERER",
    name: "Wild Magic",
    description: "Your innate magic comes from the wild forces of chaos that underlie the order of creation. You might have endured exposure to some form of raw magic, or been born during a magical event.",
    features: ["Wild Magic Surge", "Tides of Chaos", "Bend Luck", "Controlled Chaos", "Spell Bombardment"],
  },

  // ── Warlock (L1) ──────────────────────────────────────────────────────────
  {
    id: "ID_SUBCLASS_WARLOCK_ARCHFEY",
    classId: "ID_CLASS_WARLOCK",
    name: "The Archfey",
    description: "Your patron is a lord or lady of the fey, a creature of legend who holds secrets that were forgotten before the mortal races were born. This being's motivations are often inscrutable, and sometimes whimsical.",
    features: ["Expanded Spell List", "Fey Presence", "Misty Escape", "Beguiling Defenses", "Dark Delirium"],
  },
  {
    id: "ID_SUBCLASS_WARLOCK_FIEND",
    classId: "ID_CLASS_WARLOCK",
    name: "The Fiend",
    description: "You have made a pact with a fiend from the lower planes of existence, a being whose aims are evil, even if you strive against those aims. Such beings desire the corruption or destruction of all things.",
    features: ["Expanded Spell List", "Dark One's Blessing", "Dark One's Own Luck", "Fiendish Resilience", "Hurl Through Hell"],
  },
  {
    id: "ID_SUBCLASS_WARLOCK_GREATOLDONE",
    classId: "ID_CLASS_WARLOCK",
    name: "The Great Old One",
    description: "Your patron is a mysterious entity whose nature is utterly foreign to the fabric of reality. It might be from the Far Realm, the space beyond reality, or it could be one of the elder gods known only in legends.",
    features: ["Expanded Spell List", "Awakened Mind", "Entropic Ward", "Thought Shield", "Create Thrall"],
  },

  // ── Wizard (L2) ───────────────────────────────────────────────────────────
  {
    id: "ID_SUBCLASS_WIZARD_ABJURATION",
    classId: "ID_CLASS_WIZARD",
    name: "School of Abjuration",
    description: "The School of Abjuration emphasizes magic that blocks, banishes, or protects. Detractors of this school say that its tradition is about denial, negation rather than positive assertion. You create magical barriers, negate harmful effects, harm trespassers, or banish creatures to other planes of existence.",
    features: ["Abjuration Savant", "Arcane Ward", "Projected Ward", "Improved Abjuration", "Spell Resistance"],
  },
  {
    id: "ID_SUBCLASS_WIZARD_CONJURATION",
    classId: "ID_CLASS_WIZARD",
    name: "School of Conjuration",
    description: "As a conjurer, you favor spells that produce objects and creatures out of thin air. You can conjure billowing clouds of killing fog or summon creatures from elsewhere to fight on your behalf.",
    features: ["Conjuration Savant", "Minor Conjuration", "Benign Transposition", "Focused Conjuration", "Durable Summons"],
  },
  {
    id: "ID_SUBCLASS_WIZARD_DIVINATION",
    classId: "ID_CLASS_WIZARD",
    name: "School of Divination",
    description: "The counsel of a diviner is sought by royalty and commoners alike, for all seek a clearer understanding of the past, present, and future. As a diviner, you strive to part the veils of space, time, and consciousness.",
    features: ["Divination Savant", "Portent", "Expert Divination", "The Third Eye", "Greater Portent"],
  },
  {
    id: "ID_SUBCLASS_WIZARD_ENCHANTMENT",
    classId: "ID_CLASS_WIZARD",
    name: "School of Enchantment",
    description: "As a member of the School of Enchantment, you have honed your ability to magically entrance and beguile other people and monsters. Some enchanters are peacemakers who bewitch the violent to lay down their arms.",
    features: ["Enchantment Savant", "Hypnotic Gaze", "Instinctive Charm", "Split Enchantment", "Alter Memories"],
  },
  {
    id: "ID_SUBCLASS_WIZARD_EVOCATION",
    classId: "ID_CLASS_WIZARD",
    name: "School of Evocation",
    description: "You focus your study on magic that creates powerful elemental effects such as bitter cold, searing flame, rolling thunder, crackling lightning, and burning acid. Some evokers find employment in military forces, serving as artillery.",
    features: ["Evocation Savant", "Sculpt Spells", "Potent Cantrip", "Empowered Evocation", "Overchannel"],
  },
  {
    id: "ID_SUBCLASS_WIZARD_ILLUSION",
    classId: "ID_CLASS_WIZARD",
    name: "School of Illusion",
    description: "You focus your studies on magic that dazzles the senses, befuddles the mind, and tricks even the wisest folk. Your magic is subtle, but the illusions crafted by your keen mind make the impossible seem real.",
    features: ["Illusion Savant", "Improved Minor Illusion", "Malleable Illusions", "Illusory Self", "Illusory Reality"],
  },
  {
    id: "ID_SUBCLASS_WIZARD_NECROMANCY",
    classId: "ID_CLASS_WIZARD",
    name: "School of Necromancy",
    description: "The School of Necromancy explores the cosmic forces of life, death, and undeath. As you focus your studies in this tradition, you learn to manipulate the energy that animates all living things.",
    features: ["Necromancy Savant", "Grim Harvest", "Undead Thralls", "Inured to Undeath", "Command Undead"],
  },
  {
    id: "ID_SUBCLASS_WIZARD_TRANSMUTATION",
    classId: "ID_CLASS_WIZARD",
    name: "School of Transmutation",
    description: "You are a student of spells that modify energy and matter. To you, the world is not a fixed thing, but eminently mutable, and you delight in being an agent of change.",
    features: ["Transmutation Savant", "Minor Alchemy", "Transmuter's Stone", "Shapechanger", "Master Transmuter"],
  },
];
