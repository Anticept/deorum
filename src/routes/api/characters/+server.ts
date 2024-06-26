import admin from '$lib/api/admin';
import { getCachedList, getCachedPage, invalidateCache } from '$lib/cache/cacheInstance';
import type { ICharacter, IPortrait } from '$lib/types/api.types';
import { createServerError } from '$lib/utils/errors';
import { log, report } from '$lib/utils/log';
import { toJson } from '$lib/utils/requests';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const page = Number(url.searchParams.get('page'));
    const pageSize = Number(url.searchParams.get('pageSize'));

    const filters = url.searchParams.getAll('filter');
    const sort = url.searchParams.get('sort') || '';
    const expand = url.searchParams.get('expand') || '';

    if (page) {
      if (!pageSize) throw error(400, 'Page size is not defined');
      const args = [page, pageSize, filters, sort, expand] as const;
      const data = await getCachedPage<ICharacter>('characters', ...args);
      return json(data);
    }

    const args = [filters, sort, expand] as const;
    const data = await getCachedList<ICharacter>('characters', ...args);
    return json(data);
  } catch (err) {
    report('characters', err);
    throw createServerError(err);
  }
};

export const PUT: RequestHandler = async ({ request, fetch }) => {
  try {
    const data = await request.json();
    const character = await admin.records.create('characters', data);
    invalidateCache('characters');
    log('characters', `Create character`, data);

    const currentPortraits = await toJson<IPortrait[]>(
      fetch(`/api/portraits?filter=characters~"${character.id}"`)
    );
    await updatePortraits(character.portraits, character.id, currentPortraits);

    return json(character);
  } catch (err) {
    report('characters', err);
    throw createServerError(err);
  }
};

export const PATCH: RequestHandler = async ({ request, url, fetch }) => {
  try {
    const expand = url.searchParams.get('expand') || '';
    const data = await request.json();
    const character = await admin.records.update('characters', data.id, data, { expand });
    invalidateCache('characters');
    log('characters', `Update character ${data.id}`, data);

    const currentPortraits = await toJson<IPortrait[]>(
      fetch(`/api/portraits?filter=characters~"${character.id}"`)
    );
    await updatePortraits(character.portraits, character.id, currentPortraits);

    return json(character);
  } catch (err) {
    report('characters', err);
    throw createServerError(err);
  }
};

async function updatePortraits(
  portraitIds: string[],
  characterId: string,
  currentPortraits: IPortrait[] = []
) {
  try {
    const portraitsToRemove = currentPortraits.filter(
      (portrait) => !portraitIds.includes(portrait.id)
    ) as unknown as IPortrait[];

    if (portraitsToRemove.length) {
      await Promise.all(
        portraitsToRemove.map((portrait) => {
          const characters = portrait.characters.filter((id) => id !== characterId);
          return admin.records.update('portraits', portrait.id, { characters });
        })
      );
      const removedIds = portraitsToRemove.map(({ id }) => id).join(', ');
      log('characters', `Remove character ${characterId} from portraits: ${removedIds}`);
    }

    const addedPortraits = (await Promise.all(
      portraitIds.map((id) => admin.records.getOne('portraits', id))
    )) as unknown as IPortrait[];
    const portraitsToAdd = addedPortraits.filter(
      (portrait) => !portrait.characters.includes(characterId)
    );

    if (portraitsToAdd.length) {
      await Promise.all(
        portraitsToAdd.map((portrait) => {
          const characters = [...(portrait.characters || []), characterId];
          return admin.records.update('portraits', portrait.id, { characters });
        })
      );
      const addedIds = portraitsToAdd.map(({ id }) => id).join(', ');
      log('characters', `Add character ${characterId} to portraits: ${addedIds}`);
    }

    if (portraitsToAdd.length || portraitsToRemove.length) {
      invalidateCache('portraits');
    }
  } catch (err) {
    report('characters', err);
    throw createServerError(err);
  }
}
