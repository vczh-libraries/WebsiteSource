import * as a from 'gaclib-article';
import { Element } from 'xml-js';

export interface ControlTemplatesPlugin {
    kind: 'ControlTemplatesPlugin';
}

export function parseControlTemplates(e: Element): a.Plugin {
    return {
        kind: 'Plugin',
        plugin: {
            kind: 'ControlTemplatesPlugin'
        }
    };
}

export function renderControlTemplates(plugin: {}): a.Content[] {
    return [];
}
