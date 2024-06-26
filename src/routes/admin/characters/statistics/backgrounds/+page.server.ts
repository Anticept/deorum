import { toJson } from '$lib/utils/requests';

import type { IBackground, ICharacter } from '$lib/types/api.types';
import type { IStatistics } from '$lib/types/statistics.types';

export const load: import('./$types').PageServerLoad = async ({ fetch }) => {
  const [characters, backgrounds] = await Promise.all([
    toJson<ICharacter[]>(fetch('/api/characters')),
    toJson<IBackground[]>(fetch('/api/backgrounds'))
  ]);

  const aggregated = characters.reduce((acc, { background }) => {
    if (!acc[background]) acc[background] = 0;
    acc[background] += 1;

    return acc;
  }, {} as { [race: string]: number });

  for (const { id } of backgrounds) {
    if (!aggregated[id]) aggregated[id] = 0;
  }

  const backgroundsMap = new Map(backgrounds.map(({ id, name }) => [id, { name }]));
  const statistics: IStatistics[] = Object.entries(aggregated)
    .map(([id, count]) => {
      const { name } = backgroundsMap.get(id) || {};
      return { name, count };
    })
    .sort((a, b) => b.count - a.count);

  return { statistics };
};
