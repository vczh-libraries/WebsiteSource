import * as a from 'gaclib-article';
import { Element } from 'xml-js';
import { } from './xmlControlTemplateCommon';

type PluginParser = (e: Element) => a.Plugin | undefined;

export interface PropertyArticle {
    name: string;
    content: a.Paragraph[];
}

export interface ControlTemplateArticle {
    introduction: a.Paragraph[];
    inputs: PropertyArticle[];
    outputs: PropertyArticle[];
    exchanges: PropertyArticle[];
    samples: string[];
}

export function parseControlTemplateArticle(xml: string, pluginParser?: PluginParser): ControlTemplateArticle {
    return {
        introduction: [],
        inputs: [],
        outputs: [],
        exchanges: [],
        samples: []
    };
}

export function renderControlTemplateArticle(ctArticle: ControlTemplateArticle, ct: string): a.Article {
    return {
        index: true,
        numberBeforeTitle: false,
        topic: {
            kind: 'Topic',
            title: `<${ct}>`,
            content: [{
                kind: 'Paragraph',
                content: [{
                    kind: 'Text',
                    text: 'The page is under construction.'
                }]
            }]
        }
    };
}
