import { sections } from '$lib/config/story';
import type { ICharacter } from '$lib/types/api.types';
import { capitalize } from './string';

const getTags = (character: ICharacter, tags: Map<string, { name: string }>): string[] => {
  if (!character.tags.length) return [];
  const tagNames = character.tags.map((tag) => tags.get(tag)?.name);
  return tagNames.filter((tagName) => tagName) as string[];
};

const selectSections = (): string[] => {
  const selected = sections.filter((section) => Math.random() < section.chance);
  return selected
    .filter(({ excludes }) => {
      if (!excludes) return true;
      return excludes.every((exclude) => !selected.some(({ name }) => name === exclude));
    })
    .map(({ name }) => name);
};

export const createBasicPrompt = (character: ICharacter, tags: Map<string, { name: string }>) => {
  const { name, gender, age } = character;
  const { race, archetype, background } = character['@expand'];

  const d = {
    gender,
    race: race ? race.name : '',
    age: age ? `${age} years old` : null,
    name: name ? `Name: ${name}` : null,
    archetype: archetype ? `Nature (behaviour pattern): ${archetype.name}` : null,
    background: background ? `Background (origin): ${background.name}` : null
  };

  const tagList = getTags(character, tags);
  const sections = selectSections().join(', ');

  const intro = 'Write a realistic biography of a living character';
  const specie = `${d.gender} ${d.race}`.trim();
  const part1 = [specie, d.age].filter((v) => v).join(', ');
  const part2 = [d.name, d.archetype, d.background].filter((v) => v).join('. ');
  const tag = tagList.length ? `Tags: ${tagList.join(', ')}` : '';
  const section = `Possible sections (don't follow strictly): ${sections}. Remove section titles, and other sections on your choice`;
  const outro = `Detailed factual description of a ${d.race} character.`;

  const prompt = [intro, part1, part2, tag, section, outro]
    .filter((v) => v)
    .map((part) => capitalize(part))
    .join('. ');

  return prompt;
};
