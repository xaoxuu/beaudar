import { defineConfig } from 'vite';
import { posthtmlPlugin } from './vite-plugin-posthtml';
import expressions from 'posthtml-expressions';
import include from 'posthtml-include';
import md from './posthtml-md';

export default defineConfig({
  root: 'src',
  server: {
    open: true,
    port: 3000,
    host: "0.0.0.0",
  },
  plugins: [
    posthtmlPlugin({
      plugins: [
        expressions({
          root: __dirname,
          locals: {
            NODE_ENV: process.env.NODE_ENV,
          },
        }),
        include(),
        md(),
      ],
    }),
  ],
});
