import { authorize } from '$lib/api/auth';
import { locales } from '$lib/locales/translations';
import { Role } from '$lib/config';

import type { IUser } from '$lib/types/api.types';

const getLocale = (request: Request, user: IUser | null) => {
  if (user?.profile?.lang) return user.profile.lang;

  const accepted = request.headers.get('accept-language');
  const primary = accepted?.split(',')[0];
  if (primary && locales.includes(primary)) return primary;

  return 'en'; // fallback
};

export const load: import('./$types').LayoutServerLoad = async ({ request }) => {
  const { user } = await authorize(request);

  const lang = getLocale(request, user);
  const role = user?.profile.role || Role.GUEST;
  const email = user?.email || null;
  const liked = user?.profile.liked || [];

  return { lang, role, email, liked };
};
