import * as a from 'gaclib-article';
import { Element, xml2js } from 'xml-js';
import * as d from './interfaces';

function parseDocSymbol(xml: Element): d.DocSymbol {
    if (xml.attributes === undefined) {
        throw new Error(`Missing attribute "docId" (optional), "declFile", "declId" in <document>.`);
    }
    if (xml.attributes.name === undefined) {
        throw new Error(`Missing attribute "name" in <symbol>.`);
    }
    if (xml.attributes.declFile === undefined) {
        throw new Error(`Missing attribute "declFile" in <symbol>.`);
    }
    if (xml.attributes.declId === undefined) {
        throw new Error(`Missing attribute "declId" in <symbol>.`);
    }

    const dsymbol: d.DocSymbol = {
        name: `${xml.attributes.name}`,
        declFile: `${xml.attributes.declFile}`,
        declId: `${xml.attributes.declId}`
    };
    if (xml.attributes.docId !== undefined) {
        dsymbol.docId = `${xml.attributes.docId}`;
    }
    return dsymbol;
}

function parseDocSymbolsPluginObject(xml: Element): d.DocSymbolsPluginObject {
    switch (xml.name) {
        case 'symbol': {
            return { kind: 'Symbols', symbols: [parseDocSymbol(xml)] };
        }
        case 'symbols': {
            const dsymbols: d.DocSymbolsPluginObject = {
                kind: 'Symbols',
                symbols: []
            };
            if (xml.elements === undefined) {
                throw new Error('<symbols> should contain at least 1 <symbol>.');
            }
            for (const xmlSymbol of xml.elements) {
                if (xmlSymbol.type === 'element') {
                    if (xmlSymbol.name !== 'symbol') {
                        throw new Error(`Only <symbol> is allowed in <symbols>`);
                    }
                    dsymbols.symbols.push(parseDocSymbol(xmlSymbol));
                }
            }
            return dsymbols;
        }
        default:
            throw new Error('Only <symbol> or <symbols> is allowed for hyperlinks.');
    }
}

function parseDocSymbolsPlugin(xml: Element): a.Plugin {
    return { kind: 'Plugin', plugin: parseDocSymbolsPluginObject(xml) };
}

function parseDocText(xml: Element, requireName: boolean): d.DocText {
    const dtext: d.DocText = {
        paragraphs: []
    };
    if (xml.attributes !== undefined && xml.attributes.name !== undefined) {
        dtext.name = `${xml.attributes.name}`;
    }
    if (dtext.name === undefined && requireName) {
        throw new Error(`Missing attribute "name" in <${xml.name}>.`);
    }

    function insertp(p?: a.Paragraph): void {
        dtext.paragraphs.push(p ?? { kind: 'Paragraph', content: [] });
    }

    function lastp(): a.Paragraph {
        if (dtext.paragraphs.length === 0) {
            insertp();
        }
        return dtext.paragraphs[dtext.paragraphs.length - 1];
    }

    if (xml.elements !== undefined) {
        let hasTextContent = false;
        let hasArticleContent = false;

        for (const xmlContent of xml.elements) {
            switch (xmlContent.type) {
                case 'text':
                case 'cdata': {
                    hasTextContent = true;
                    break;
                }
                case 'element': {
                    switch (xmlContent.name) {
                        case 'symbol':
                        case 'symbols': {
                            hasTextContent = true;
                            break;
                        }
                        case 'p': {
                            hasArticleContent = true;
                            break;
                        }
                        default:
                            throw new Error(`Unrecognizable element <${xmlContent.name}> in <${xml.name}>.`);
                    }
                }
                default:
            }
        }

        if (hasTextContent && hasArticleContent) {
            throw new Error(`A document content should either contain only multiple <p>, or contain only multiple plain text, cdata, <symbol> and <symbols>.`);
        } else if (hasTextContent) {
            for (const xmlContent of xml.elements) {
                let needInsertParagraph = false;
                switch (xmlContent.type) {
                    case 'text':
                    case 'cdata': {
                        const text = `${xmlContent[xmlContent.type]}`;
                        const lines = text.split('\n');

                        for (let i = 0; i < lines.length; i++) {
                            const line = lines[i];
                            if (i > 0 && dtext.paragraphs.length > 0 && lastp().content.length > 0) {
                                needInsertParagraph = true;
                            }

                            if (line.trim() !== '') {
                                if (needInsertParagraph) {
                                    insertp();
                                    needInsertParagraph = false;
                                }
                                lastp().content.push({ kind: 'Text', text: line });
                            }
                        }
                        break;
                    }
                    case 'element': {
                        if (needInsertParagraph) {
                            insertp();
                            needInsertParagraph = false;
                        }
                        lastp().content.push(parseDocSymbolsPlugin(xmlContent));
                        break;
                    }
                    default:
                }
            }

            for (const p of dtext.paragraphs) {
                for (let i = 0; i < p.content.length; i++) {
                    const text = p.content[i];
                    if (text.kind === 'Text') {
                        if (i === 0 || p.content[i - 1].kind === 'Text') {
                            text.text = text.text.trimLeft();
                        }
                        if (i === p.content.length - 1 || p.content[i + 1].kind === 'Text') {
                            text.text = text.text.trimRight();
                        }
                    }
                }
            }
        } else if (hasArticleContent) {
            for (const xmlContent of xml.elements) {
                insertp(a.parseParagraph(xmlContent, (e: Element) => {
                    switch (e.name) {
                        case 'symbol':
                        case 'symbols':
                            return parseDocSymbolsPlugin(e);
                        default:
                            return undefined;
                    }
                }));
            }
        }
    }
    return dtext;
}

type ExampleRetriver = (index: number) => d.DocExample;

export function parseDocArticle(xml: string, exampleRetriver: ExampleRetriver): d.DocArticle {
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
        throw new Error(`Root element of an article should be <document>.`);
    }

    const xmlArticle = element.elements[0];
    if (xmlArticle.name !== 'Document') {
        throw new Error(`Root element of an article should be <document> instead of <${xmlArticle.name}>.`);
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
    if (xmlArticle.attributes.declFile === undefined) {
        throw new Error(`Missing attribute "declFile" in <document>.`);
    }
    if (xmlArticle.attributes.declId === undefined) {
        throw new Error(`Missing attribute "declId" in <document>.`);
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
        name: `${xmlArticle.attributes.name}`,
        declFile: `${xmlArticle.attributes.declFile}`,
        declId: `${xmlArticle.attributes.declId}`
    };

    if (xmlArticle.elements !== undefined) {
        for (const subElement of xmlArticle.elements) {
            if (subElement.type === 'element') {
                switch (subElement.name) {
                    case 'summary':
                    case 'remarks':
                    case 'returns': {
                        darticle[subElement.name] = parseDocText(subElement, false);
                        break;
                    }
                    case 'typeparam':
                    case 'param':
                    case 'enumitem': {
                        if (darticle[subElement.name] === undefined) {
                            darticle[subElement.name] = [];
                        }
                        darticle[subElement.name]?.push(parseDocText(subElement, true));
                        break;
                    }
                    case 'signature': {
                        if (subElement.elements === undefined || subElement.elements.length !== 1 || subElement.elements[0].type !== 'cdata') {
                            throw new Error(`Only CData is allowed in <signature>.`);
                        }
                        darticle.signature = `${subElement.elements[0].cdata}`;
                        break;
                    }
                    case 'example': {
                        if (subElement.attributes !== undefined && subElement.attributes.index !== undefined) {
                            darticle.example = exampleRetriver(<number>subElement.attributes.index);
                        } else {
                            if (subElement.elements === undefined || subElement.elements.length !== 1 || subElement.elements[0].type !== 'cdata') {
                                throw new Error(`Only CData is allowed in <example>.`);
                            }
                            darticle.example = { code: `${subElement.elements[0].cdata}` };
                        }
                        break;
                    }
                    case 'basetypes':
                    case 'seealsos': {
                        if (subElement.elements !== undefined) {
                            for (const xmlSymbol of subElement.elements) {
                                if (xmlSymbol.type === 'element') {
                                    if (xmlSymbol.name !== 'symbol') {
                                        throw new Error(`Only <symbol> is allowed in <${subElement.name}>`);
                                    }

                                    const dsymbol = parseDocSymbol(xmlSymbol);
                                    if (darticle[subElement.name] === undefined) {
                                        darticle[subElement.name] = [];
                                    }
                                    darticle[subElement.name]?.push(dsymbol);
                                }
                            }
                        }
                        break;
                    }
                    default:
                        throw new Error(`Unrecognizable top level element: <${subElement.name}>.`);
                }
            }
        }
    }

    return darticle;
}
