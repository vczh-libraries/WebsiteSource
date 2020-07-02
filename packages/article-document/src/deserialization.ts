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

    function insertp(): void {
        dtext.paragraphs.push({ content: [] });
    }

    function lastp(): d.DocParagraph {
        if (dtext.paragraphs.length === 0) {
            insertp();
        }
        return dtext.paragraphs[dtext.paragraphs.length - 1];
    }

    if (xml.elements !== undefined) {
        for (const xmlContent of xml.elements) {
            switch (xmlContent.type) {
                case 'text':
                case 'cdata': {
                    const text = `${xmlContent[xmlContent.type]}`;
                    const lines = text.split('\n').map((s: string) => s.trim()).filter((s: string) => s !== '');
                    for (let i = 0; i < lines.length; i++) {
                        if (i > 0) {
                            insertp();
                        }
                        lastp().content.push({ kind: 'Text', text: lines[i] });
                    }
                    break;
                }
                case 'element': {
                    if (xmlContent.name === 'symbol') {
                        lastp().content.push({ kind: 'Symbols', symbols: [parseDocSymbol(xmlContent)] });
                    } else if (xmlContent.name === 'symbols') {
                        const dsymbols: d.DocSymbols = {
                            kind: 'Symbols',
                            symbols: []
                        };
                        if (xmlContent.elements === undefined) {
                            throw new Error('<symbols> should contain at least 1 <symbol>.');
                        }
                        for (const xmlSymbol of xmlContent.elements) {
                            if (xmlSymbol.type === 'element') {
                                if (xmlSymbol.name !== 'symbol') {
                                    throw new Error(`Only <symbol> is allowed in <symbols>`);
                                }
                                dsymbols.symbols.push(parseDocSymbol(xmlSymbol));
                            }
                        }
                        lastp().content.push(dsymbols);
                    } else {
                        throw new Error(`Unrecognizable element <${xmlContent.name}> in <${xml.name}>.`);
                    }
                    break;
                }
                default:
            }
        }
    }
    return dtext;
}

export function parseDocArticle(xml: string): d.DocArticle {
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
                        if (subElement.elements === undefined || subElement.elements.length !== 1 || subElement.elements[0].type !== 'cdata') {
                            throw new Error(`Only CData is allowed in <example>.`);
                        }
                        darticle.example = `${subElement.elements[0].cdata}`;
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
