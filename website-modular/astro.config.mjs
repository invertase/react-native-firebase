import { defineConfig } from 'astro/config';
// FIXME: use actual adapter for prod
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
    output: 'hybrid',
    adapter: node({
        mode: 'standalone',
    }),
});
