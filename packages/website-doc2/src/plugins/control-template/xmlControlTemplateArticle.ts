import * as a from 'gaclib-article';
import { Element, xml2js } from 'xml-js';
import { hierarchyIndex } from './xmlControlTemplateCommon';

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
    samples: a.Paragraph[];
}

function parseArticle(element: Element, pluginParser: PluginParser): a.Paragraph[] {
    return element.elements === undefined ? [] : element.elements.map((xmlParagraph: Element) => {
        if (xmlParagraph.name === 'p') {
            return a.parseParagraph(xmlParagraph, pluginParser);
        } else if (xmlParagraph.name !== undefined) {
            throw new Error(`<p> is expected but <${xmlParagraph.name}> found.`);
        } else {
            throw new Error(`<p> is expected but non-element node "${xmlParagraph.type}" found.`);
        }
    });
}

export function parseControlTemplateArticle(xml: string, pluginParser?: PluginParser): ControlTemplateArticle {
    const ctArticle: ControlTemplateArticle = {
        introduction: [],
        inputs: [],
        outputs: [],
        exchanges: [],
        samples: []
    };

    const xmlCt = <Element>xml2js(
        xml,
        {
            compact: false,
            ignoreDeclaration: true,
            ignoreInstruction: true,
            ignoreComment: true,
            ignoreDoctype: true
        }
    );

    const pp = pluginParser === undefined ? (() => undefined) : pluginParser;

    if (xmlCt.elements !== undefined) {
        if (xmlCt.elements.length !== 1 || xmlCt.elements[0].name !== 'control-template-document') {
            throw new Error(`Root element must be <control-template-document>.`);
        }
        const xmlCtd = xmlCt.elements[0];
        if (xmlCtd.elements !== undefined) {
            for (const categoryXml of xmlCtd.elements) {
                switch (categoryXml.name) {
                    case 'introduction':
                    case 'samples': {
                        ctArticle[categoryXml.name] = parseArticle(categoryXml, pp);
                        break;
                    }
                    case 'inputs':
                    case 'outputs':
                    case 'exchanges': {
                        if (categoryXml.elements !== undefined) {
                            for (const propXml of categoryXml.elements) {
                                if (propXml.name === 'prop') {
                                    const propName = <string | undefined>propXml.attributes?.name;
                                    if (propName === undefined) {
                                        throw new Error(`Missing attribute name in <prop>.`);
                                    }
                                    const propArticle: PropertyArticle = {
                                        name: propName,
                                        content: parseArticle(propXml, pp)
                                    };
                                    ctArticle[categoryXml.name].push(propArticle);
                                } else {
                                    throw new Error(`Unknown tag <${propXml.name}> in <${categoryXml.name}>.`);
                                }
                            }
                        }
                        break;
                    }
                    default: {
                        throw new Error(`Unknown tag <${categoryXml.name}> in <control-template-document>.`);
                    }
                }
            }
        }
    }

    return ctArticle;
}

function ensureParagraph(ps: a.Paragraph[]): a.Paragraph[] {
    return ps.length > 0 ? ps : [{
        kind: 'Paragraph',
        content: [{
            kind: 'Text',
            text: 'This page is under construction.'
        }]
    }];
}

export function renderControlTemplateArticle(ctArticle: ControlTemplateArticle, ct: string): a.Article {
    const hierarchy = hierarchyIndex[ct];
    const topics: a.Topic[] = [];

    topics.push({
        kind: 'Topic',
        title: 'Introduction',
        content: ensureParagraph(ctArticle.introduction)
    });

    if (ctArticle.inputs.length > 0) {
        topics.push({
            kind: 'Topic',
            title: 'Input Property',
            content: ctArticle.inputs.map((pa: PropertyArticle): a.Topic => ({
                kind: 'Topic',
                title: pa.name,
                content: ensureParagraph(pa.content)
            }))
        });
    }

    if (ctArticle.outputs.length > 0) {
        topics.push({
            kind: 'Topic',
            title: 'Output Property',
            content: ctArticle.outputs.map((pa: PropertyArticle): a.Topic => ({
                kind: 'Topic',
                title: pa.name,
                content: ensureParagraph(pa.content)
            }))
        });
    }

    if (ctArticle.exchanges.length > 0) {
        topics.push({
            kind: 'Topic',
            title: 'Exchange Property',
            content: ctArticle.exchanges.map((pa: PropertyArticle): a.Topic => ({
                kind: 'Topic',
                title: pa.name,
                content: ensureParagraph(pa.content)
            }))
        });
    }

    if (ctArticle.samples.length > 0) {
        topics.push({
            kind: 'Topic',
            title: 'Sample',
            content: ensureParagraph(ctArticle.samples)
        });
    }

    return {
        index: true,
        numberBeforeTitle: false,
        topic: {
            kind: 'Topic',
            title: `<${ct}>`,
            content: [{
                kind: 'Paragraph',
                content: [{
                    kind: 'Strong',
                    content: [{
                        kind: 'Text',
                        text: `<${ct}>`
                    }]
                }, {
                    kind: 'Text',
                    text: ` inherits from `
                }, {
                    kind: 'Strong',
                    content: [{
                        kind: 'Text',
                        text: (hierarchy.parent === undefined ? 'GuiTemplate' : `<${hierarchy.parent.controlTemplate}>`)
                    }]
                }]
            },
            ...topics]
        }
    };
}
