export interface DisplaySpell {
  id: string;
  name: string;
  level: number;
  school: string;
  classes: string[];
  concentration: boolean;
  ritual: boolean;
  castingTime: string;
  range: string;
  duration: string;
  components: string;
  description?: string;
  sourceLabel: string;
}
