import { Element, xml2js } from 'xml-js';
import * as d from './interfaces';

export function parseDocument(xml: string): d.DocArticle {
    const element = <Element>xml2js(
        xml,
        {
            compact: false,
            ignoreDeclaration: true,
            ignoreInstruction: true,
            ignoreComment: true,
            ignoreDoctype: true
        }
    );

    throw new Error(`Root element of an article should be <document> instead of <${element.name}>.`);
}
