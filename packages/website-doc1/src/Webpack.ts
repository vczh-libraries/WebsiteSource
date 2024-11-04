import { ViewMetadata } from 'gaclib-render';
import * as path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import { views } from './views/index.js';

const exportedArray = views.map((metadata: ViewMetadata) => {
    return {
        entry: path.resolve(`./lib/views/${metadata.source}`),
        output: {
            path: path.resolve(`./lib/dist${path.dirname(metadata.path)}`),
            filename: path.basename(metadata.path),
            library: metadata.name,
            libraryTarget: 'window',
            libraryExport: 'viewExport'
        },
        mode: 'production',
        optimization: {
            minimize: true,
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        output: {
                            comments: false
                        }
                    },
                    extractComments: false
                })
            ]
        }
    };
});

export default exportedArray;
