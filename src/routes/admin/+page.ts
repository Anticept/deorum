import PocketBase from 'pocketbase';

import { URL } from '$lib/config';

export const prerender = 'auto';
export const ssr = true;

const PAGE_SIZE = 100;
const filter = 'active = true';
const sort = '+original';

/** @type {import('./$types').PageLoad} */
export async function load() {
  const client = new PocketBase(URL);
  const page = 1;

  const portraitsRequest = client.records.getList('portraits', page, PAGE_SIZE, { filter, sort });
  const tagsRequest = client.records.getFullList('tags', 100);
  const stylesRequest = client.records.getFullList('styles', 100);
  const originalsRequest = client.records.getFullList('originals', 100);

  const [portraitsList, tagsData, stylesData, originalsData] = await Promise.all([
    portraitsRequest,
    tagsRequest,
    stylesRequest,
    originalsRequest
  ]);

  const portraits = portraitsList.items;
  const hasMore = portraitsList.totalPages > 1;

  const tags = new Map(tagsData.map((tag) => [tag.id, `${tag.emoji} ${tag.name}`]));

  const styles = new Map(stylesData.map((style) => [style.id, `${style.emoji} ${style.name}`]));

  const originals = new Map(
    originalsData.map((original) => {
      const { id, image, name } = original;
      return [id, { image, name }];
    }) as [string, { image: string; name: string }][]
  );

  const portraitsImagePath = `${URL}/api/files/${portraits[0]?.['@collectionId']}`;
  const originalsImagePath = `${URL}/api/files/${originalsData[0]?.['@collectionId']}`;

  return {
    page,
    hasMore,
    filter,
    sort,
    portraits,
    tags,
    styles,
    originals,
    portraitsImagePath,
    originalsImagePath
  };
}