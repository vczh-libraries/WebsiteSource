import { buildViews } from 'gaclib-render-esbuild';
import { views } from './views/index.js';

await buildViews(views);