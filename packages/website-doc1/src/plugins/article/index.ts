import * as a from 'gaclib-article';
import { Element } from 'xml-js';
import { ControlTemplatesPlugin, parseControlTemplates, renderControlTemplates } from './xmlControlTemplates';
import { parseSample, renderSample, SamplePlugin } from './xmlSample';

export function parseArticlePlugin(e: Element): a.Plugin | undefined {
    if (e.type === 'element') {
        switch (e.name) {
            case 'sample': {
                return parseSample(e);
            }
            case 'control-templates': {
                return parseControlTemplates(e);
            }
            default: {
                return undefined;
            }
        }
    }
    return undefined;
}

export function renderArticlePlugin(plugin: {}): a.Content[] {
    const sp = (<ControlTemplatesPlugin | SamplePlugin>plugin);
    const kind = sp.kind;
    switch (sp.kind) {
        case 'SamplePlugin': {
            return renderSample(plugin);
        }
        case 'ControlTemplatesPlugin': {
            return renderControlTemplates();
        }
        default: {
            throw new Error(`Unrecognized plugin kind: ${kind}.`);
        }
    }
}
