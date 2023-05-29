import adapter from '@sveltejs/adapter-vercel';
import sveltePreprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: sveltePreprocess({
    scss: { prependData: '@use "src/theme/variables.scss" as *;' }
  }),

  kit: {
    adapter: adapter()
  },

  files: {
    lib: 'src/lib'
  }
};

export default config;
