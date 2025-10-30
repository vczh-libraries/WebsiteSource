import { build } from 'esbuild';
import type { ViewMetadata } from 'gaclib-render';
import * as path from 'path';

async function buildViews(views: ViewMetadata[]) {
    for (const metadata of views) {
        try {
            const sanitizedName = `sanitized_${metadata.name.replace(/[^a-zA-Z0-9_$]/g, '_')}`;
            await build({
                entryPoints: [path.resolve(`./lib/views/${metadata.source}`)],
                bundle: true,
                minify: true,
                format: 'iife',
                globalName: sanitizedName,
                outfile: path.resolve(`./lib/dist${metadata.path}`),
                platform: 'browser',
                target: 'es2022',
                footer: {
                    js: `window['${metadata.name}'] = ${sanitizedName}.viewExport;`
                }
            });
            console.log(`✓ Built ${metadata.name}`);
        } catch (error) {
            console.error(`✗ Failed to build ${metadata.name}:`, error);
            throw error;
        }
    }
    console.log('All views built successfully!');
}

export { buildViews };