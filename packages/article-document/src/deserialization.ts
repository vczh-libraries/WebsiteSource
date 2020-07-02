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

    if (element.elements === undefined) {
        throw new Error(`Root element of an article should be <document> instead of <${element.name}>.`);
    }

    const xmlArticle = element.elements[0];
    if (xmlArticle.name !== 'document') {
        throw new Error(`Root element of an article should be <document> instead of <${element.name}>.`);
    }
    if (xmlArticle.attributes === undefined) {
        throw new Error(`Missing attribute "symbolId", "accessor", "category" and "name" in <document>.`);
    }
    if (xmlArticle.attributes.symbolId === undefined) {
        throw new Error(`Missing attribute "symbolId" in <document>.`);
    }
    if (xmlArticle.attributes.accessor === undefined) {
        throw new Error(`Missing attribute "accessor" in <document>.`);
    }
    if (xmlArticle.attributes.category === undefined) {
        throw new Error(`Missing attribute "category" in <document>.`);
    }
    if (xmlArticle.attributes.name === undefined) {
        throw new Error(`Missing attribute "name" in <document>.`);
    }

    if (!(<readonly string[]>d.acceptableAccessors).includes(`${xmlArticle.attributes.accessor}`)) {
        throw new Error(`Attribute "accessor" in <document> can only be one of ${JSON.stringify(d.acceptableAccessors)}.`);
    }
    if (!(<readonly string[]>d.acceptableCategories).includes(`${xmlArticle.attributes.category}`)) {
        throw new Error(`Attribute "category" in <document> can only be one of ${JSON.stringify(d.acceptableCategories)}.`);
    }

    const darticle: d.DocArticle = {
        symbolId: `${xmlArticle.attributes.symbolId}`,
        accessor: <typeof d.acceptableAccessors[number]>`${xmlArticle.attributes.accessor}`,
        category: <typeof d.acceptableCategories[number]>`${xmlArticle.attributes.category}`,
        name: `${xmlArticle.attributes.name}`
    };
    darticle.name = darticle.name;
    return darticle;
}
