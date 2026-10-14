import { Concept, SectionId } from '../../types/concept';
import { SECTION_1_CONCEPTS } from './section1';
import { SECTION_2_CONCEPTS } from './section2';
import { SECTION_3_CONCEPTS } from './section3';
import { SECTION_4_CONCEPTS } from './section4';
import { SECTION_5_CONCEPTS } from './section5';
import { SECTION_6_CONCEPTS } from './section6';
import { SECTION_7_CONCEPTS } from './section7';

export { SECTIONS } from './sections';

export const ALL_CONCEPTS: Concept[] = [
  ...SECTION_1_CONCEPTS,
  ...SECTION_2_CONCEPTS,
  ...SECTION_3_CONCEPTS,
  ...SECTION_4_CONCEPTS,
  ...SECTION_5_CONCEPTS,
  ...SECTION_6_CONCEPTS,
  ...SECTION_7_CONCEPTS,
];

export const CONCEPTS_BY_ID: Record<number, Concept> = ALL_CONCEPTS.reduce(
  (acc, concept) => {
    acc[concept.id] = concept;
    return acc;
  },
  {} as Record<number, Concept>
);

export function getConceptsBySection(sectionId: SectionId): Concept[] {
  return ALL_CONCEPTS.filter((c) => c.sectionId === sectionId);
}

export function getConceptById(id: number): Concept | undefined {
  return CONCEPTS_BY_ID[id];
}
