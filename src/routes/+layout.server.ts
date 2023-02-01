import { authorize } from '$lib/api/auth';
import { locales } from '$lib/locales/translations';
import { report } from '$lib/utils/log';
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
  let user: IUser | null = null;

  try {
    const cookie = request.headers.get('cookie');
    if (cookie) user = await authorize(cookie);
  } catch (error) {
    report('auth', error, request);
  }

  const lang = getLocale(request, user);
  const role = user?.profile?.role || Role.GUEST;
  const email = user?.email || null;

  return { lang, role, email };
};
