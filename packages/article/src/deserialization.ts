import { EOL } from 'os';
import { Element, xml2js } from 'xml-js';
import * as a from './interfaces.js';

type PluginParser = (e: Element) => a.Plugin | undefined;

function parseTextContent(container: Element, allowEmpty: boolean): string {
    if (container.elements !== undefined) {
        if (container.elements.length === 1) {
            const xmlText = container.elements[0];
            if (xmlText.type === 'text' && typeof xmlText.text === 'string') {
                return xmlText.text;
            }
        }
        throw new Error(`Only text should exist in <${container.name}>.`);
    } else {
        if (allowEmpty) {
            return '';
        } else {
            throw new Error(`<${container.name}> should not be empty.`);
        }
    }
}

function parseListItem(container: Element, pluginParser: PluginParser): a.ContentListItem | a.ParagraphListItem {
    if (container.attributes !== undefined && container.attributes.length !== 0) {
        throw new Error(`No attribute is allowed in <${container.name}>.`);
    }

    if (container.elements === undefined || container.elements.length === 0) {
        throw new Error(`<${container.name}> should not be empty.`);
    }

    if (container.elements[0].type === 'element' && container.elements[0].name === 'p') {
        const item: a.ParagraphListItem = {
            kind: 'ParagraphListItem',
            paragraphs: []
        };
        for (const xmlChild of container.elements) {
            if (xmlChild.type === 'element' && xmlChild.name === 'p') {
                item.paragraphs.push(parseParagraph(xmlChild, pluginParser));
            } else {
                throw new Error(`<p> should not mix with other content in <${container.name}>.`);
            }
        }
        return item;
    } else {
        return {
            kind: 'ContentListItem',
            content: parseContent(container, pluginParser)
        };
    }
}

function parseList(container: Element, ordered: boolean, pluginParser: PluginParser): a.List {
    const l: a.List = {
        kind: 'List',
        ordered,
        items: []
    };

    if (container.attributes !== undefined && container.attributes.length !== 0) {
        throw new Error(`No attribute is allowed in <${container.name}>.`);
    }

    if (container.elements !== undefined) {
        CHILD_LOOP:
        for (const xmlChild of container.elements) {
            if (xmlChild.type === 'element') {
                switch (xmlChild.name) {
                    case 'li': {
                        l.items.push(parseListItem(xmlChild, pluginParser));
                        continue CHILD_LOOP;
                    }
                    default:
                        throw new Error(`Only <li> is allowed in <${container.name}> instead of <${xmlChild.name}>.`);
                }
            }
            throw new Error(`Only elements are allowed in <${container.name}> instead of ${xmlChild.type}.`);
        }
    }

    return l;
}

export function trimEmptyLines(cdataContainer: Element): string {
    if (cdataContainer.elements === undefined) {
        throw new Error(`<${cdataContainer.name}> should not be empty.`);
    }

    if (cdataContainer.elements.length === 0) {
        throw new Error(`There should be at least one cdata in <${cdataContainer.name}>.`);
    }

    let cdataText = '';
    for (const cdata of cdataContainer.elements) {
        if (cdata.type !== 'cdata') {
            throw new Error(`Only cdata could exist in <${cdataContainer.name}>.`);
        }
        cdataText += cdata.cdata;
    }

    const lines = cdataText.split(/\r?\n/);
    while (lines.length > 0) {
        if (/^\s*$/.test(lines[0])) {
            lines.shift();
        } else {
            break;
        }
    }

    while (lines.length > 0) {
        if (/^\s*$/.test(lines[lines.length - 1])) {
            lines.pop();
        } else {
            break;
        }
    }

    let indent = -1;
    for (const line of lines) {
        if (line.trim() !== '') {
            const lineIndent = line.length - line.trimLeft().length;
            if (indent === -1 || indent > lineIndent) {
                indent = lineIndent;
            }
        }
    }
    if (indent === -1) {
        return lines.join(EOL);
    } else {
        return lines.map((line: string) => line.substr(indent)).join(EOL);
    }
}

function parseProgram(container: Element): a.Program {
    const p: a.Program = {
        kind: 'Program',
        code: ''
    };

    if (container.attributes !== undefined) {
        for (const key of Object.keys(container.attributes)) {
            switch (key) {
                case 'project':
                    if (typeof container.attributes.project !== 'string') {
                        throw new Error(`Attribute ${key} in <program> should be a string.`);
                    }
                    p.project = container.attributes.project;
                    break;
                case 'language':
                    if (typeof container.attributes.language !== 'string') {
                        throw new Error(`Attribute ${key} in <program> should be a string.`);
                    }
                    p.language = container.attributes.language;
                    break;
                default:
                    throw new Error(`Only "project" and "language" attributes are allowed in <program> instead of "${key}".`);
            }
        }
    }

    if (container.elements !== undefined) {
        CHILD_LOOP:
        for (const xmlChild of container.elements) {
            if (xmlChild.type === 'element') {
                switch (xmlChild.name) {
                    case 'code': {
                        p.code = trimEmptyLines(xmlChild);
                        continue CHILD_LOOP;
                    }
                    case 'output': {
                        p.output = trimEmptyLines(xmlChild).split(/\r?\n/);
                        continue CHILD_LOOP;
                    }
                    default:
                        throw new Error(`Only <code>, <program> are allowed in <${container.name}> instead of <${xmlChild.name}>.`);
                }
            }
            throw new Error(`Only elements are allowed in <${container.name}> instead of ${xmlChild.type}.`);
        }
    }

    if (p.code === '') {
        throw new Error('<code> should exist in <program>.');
    }

    return p;
}

function parseContent(container: Element, pluginParser: PluginParser, addParagraphToErrorMessage: boolean = false): a.Content[] {
    const content: a.Content[] = [];
    if (container.elements !== undefined) {
        CHILD_LOOP:
        for (const xmlChild of container.elements) {
            switch (xmlChild.type) {
                case 'text':
                    if (typeof xmlChild.text === 'string') {
                        content.push({
                            kind: 'Text',
                            text: xmlChild.text
                        });
                    }
                    break;
                case 'element':
                    switch (xmlChild.name) {
                        case 'a': {
                            if (xmlChild.attributes !== undefined) {
                                const atts = Object.keys(xmlChild.attributes);
                                if (atts.length === 1 && atts[0] === 'href') {
                                    if (typeof xmlChild.attributes.href !== 'string') {
                                        throw new Error(`Attribute ${atts[0]} in <a> should be a string.`);
                                    }
                                    content.push({
                                        kind: 'PageLink',
                                        href: xmlChild.attributes.href,
                                        content: parseContent(xmlChild, pluginParser)
                                    });
                                    continue CHILD_LOOP;
                                }
                            }
                            throw new Error('Exactly only "href" attribute is allowed in <a>.');
                        }
                        case 'as': {
                            const links = <a.PageLink[]>parseContent(xmlChild, pluginParser);
                            if (links.length < 2) {
                                throw new Error('There must be at least two <a> in <as>.');
                            }
                            for (const link of links) {
                                if (link.kind !== 'PageLink') {
                                    throw new Error('Only <a> is allowed in <as>.');
                                }
                            }
                            for (const link of links.slice(1)) {
                                if (link.content.length !== 0) {
                                    throw new Error('Only the first <a> in <as> is allowed to have content.');
                                }
                            }
                            content.push({
                                kind: 'MultiPageLink',
                                href: links.map((link: a.PageLink) => link.href),
                                content: links[0].content
                            });
                            continue CHILD_LOOP;
                        }
                        case 'name': {
                            if (xmlChild.attributes !== undefined && xmlChild.attributes.length !== 0) {
                                throw new Error('No attribute is allowed in <name>.');
                            }
                            content.push({
                                kind: 'Name',
                                text: parseTextContent(xmlChild, false)
                            });
                            continue CHILD_LOOP;
                        }
                        case 'img': {
                            if (xmlChild.attributes !== undefined) {
                                const atts = Object.keys(xmlChild.attributes);
                                if (atts.length === 1) {
                                    switch (atts[0]) {
                                        case 'src': {
                                            if (typeof xmlChild.attributes.src !== 'string') {
                                                throw new Error(`Attribute ${atts[0]} in <img> should be a string.`);
                                            }
                                            const caption = parseTextContent(xmlChild, true);
                                            if (caption === '') {
                                                content.push({
                                                    kind: 'Image',
                                                    src: xmlChild.attributes.src
                                                });
                                            } else {
                                                content.push({
                                                    kind: 'Image',
                                                    src: xmlChild.attributes.src,
                                                    caption
                                                });
                                            }
                                            continue CHILD_LOOP;
                                        }
                                        default:
                                    }
                                }
                            }
                            throw new Error('Exactly one "src" attribute is allowed in <img>.');
                        }
                        case 'ul': case 'ol': {
                            content.push(parseList(xmlChild, xmlChild.name === 'ol', pluginParser));
                            continue CHILD_LOOP;
                        }
                        case 'b': {
                            if (xmlChild.attributes !== undefined && xmlChild.attributes.length !== 0) {
                                throw new Error('No attribute is allowed in <b>.');
                            }
                            content.push({
                                kind: 'Strong',
                                content: parseContent(xmlChild, pluginParser)
                            });
                            continue CHILD_LOOP;
                        }
                        case 'em': {
                            if (xmlChild.attributes !== undefined && xmlChild.attributes.length !== 0) {
                                throw new Error('No attribute is allowed in <em>.');
                            }
                            content.push({
                                kind: 'Emphasise',
                                content: parseContent(xmlChild, pluginParser)
                            });
                            continue CHILD_LOOP;
                        }
                        case 'program': {
                            content.push(parseProgram(xmlChild));
                            continue CHILD_LOOP;
                        }
                        case 'p':
                            if (addParagraphToErrorMessage) {
                                throw new Error(`<p> should not mix with other content in <${container.name}>.`);
                            }
                            // eslint-disable-next-line no-fallthrough
                        default: {
                            const plugin = pluginParser(xmlChild);
                            if (plugin === undefined) {
                                throw new Error(`Only text, <a>, <as>, <symbol>, <name>, <img>, <ul>, <ol>, <b>, <em>, <program>${addParagraphToErrorMessage ? ', <p>' : ''} are allowed in <${container.name}> instead of <${xmlChild.name}>.`);
                            } else {
                                content.push(plugin);
                                continue CHILD_LOOP;
                            }
                        }
                    }
                default:
                    throw new Error(`Only text and elements are allowed in <${container.name}> instead of ${xmlChild.type}.`);
            }
        }
    }
    return content;
}

export function parseParagraph(xmlParagraph: Element, pluginParser: PluginParser): a.Paragraph {
    return {
        kind: 'Paragraph',
        content: parseContent(xmlParagraph, pluginParser)
    };
}

function parseTopic(xmlTopic: Element, pluginParser: PluginParser): a.Topic {
    let anchor: string | undefined;
    let title: string | undefined;
    const content: (a.Paragraph | a.Topic)[] = [];

    if (xmlTopic.attributes !== undefined) {
        for (const key of Object.keys(xmlTopic.attributes)) {
            switch (key) {
                case 'anchor': {
                    const anchorValue = xmlTopic.attributes.anchor;
                    if (typeof anchorValue === 'string') {
                        anchor = anchorValue;
                    } else {
                        throw new Error(`Attribute ${key} in <topic> should be a string.`);
                    }
                    break;
                }
                default:
                    throw new Error(`Only "anchor" attribute is allowed in <topic> instead of "${key}".`);
            }
        }
    }

    if (xmlTopic.elements !== undefined) {
        CHILD_LOOP:
        for (const xmlChild of xmlTopic.elements) {
            if (xmlChild.type === 'element') {
                switch (xmlChild.name) {
                    case 'title': {
                        title = parseTextContent(xmlChild, false);
                        continue CHILD_LOOP;
                    }
                    case 'p':
                        content.push(parseParagraph(xmlChild, pluginParser));
                        continue CHILD_LOOP;
                    case 'topic':
                        content.push(parseTopic(xmlChild, pluginParser));
                        continue CHILD_LOOP;
                    default:
                }
            }
            throw new Error('Only <title>, <p>, <topic> are allowed in <topic>.');
        }
    }

    if (title === undefined) {
        throw new Error(`Exactly one <title> should exist in <topic>.`);
    }

    const topic: a.Topic = {
        kind: 'Topic',
        title,
        content
    };
    if (anchor !== undefined) {
        topic.anchor = anchor;
    }
    return topic;
}

export function parseArticle(xml: string, pluginParser?: PluginParser): a.Article {
    const pp = pluginParser === undefined ? () => undefined : pluginParser;

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

    if (element.elements !== undefined) {
        const xmlArticle = element.elements[0];
        if (xmlArticle.type === 'element' && xmlArticle.name === 'article') {
            let articleIndex = false;
            let articleNumberBeforeTitle = false;
            if (xmlArticle.attributes !== undefined) {
                for (const key of Object.keys(xmlArticle.attributes)) {
                    switch (key) {
                        case 'index':
                            switch (xmlArticle.attributes.index) {
                                case 'true': articleIndex = true; break;
                                case 'false': break;
                                default:
                                    throw new Error(`Attribute ${key} in <article> should be a boolean.`);
                            }
                            break;
                        case 'numberBeforeTitle':
                            switch (xmlArticle.attributes.numberBeforeTitle) {
                                case 'true': articleNumberBeforeTitle = true; break;
                                case 'false': break;
                                default:
                                    throw new Error(`Attribute ${key} in <article> should be a boolean.`);
                            }
                            break;
                        default:
                            throw new Error(`Unrecognized attribute ${key} in <article>.`);
                    }
                }
            }

            if (xmlArticle.elements !== undefined) {
                const xmlTopic = xmlArticle.elements[0];
                if (xmlTopic.type === 'element' || xmlTopic.name === 'topic') {
                    return {
                        index: articleIndex,
                        numberBeforeTitle: articleNumberBeforeTitle,
                        topic: parseTopic(xmlTopic, pp)
                    };
                }
            }

            throw new Error(`Exactly one <topic> should exist in <article>.`);
        }
    }
    throw new Error(`Root element of an article should be <article> instead of <${element.name}>.`);

}
