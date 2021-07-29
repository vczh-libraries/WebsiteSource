import * as a from 'gaclib-article';
import { Element } from 'xml-js';
import { Hierarchy, hierarchyRoot, propertiesMetadata, themeNamesMetadata } from '../control-template/xmlControlTemplateCommon';

export interface ControlTemplatesPlugin {
    kind: 'ControlTemplatesPlugin';
    details: boolean;
}

export function parseControlTemplates(e: Element): a.Plugin {
    let details: boolean = false;
    if (e.attributes === undefined) {
        throw new Error(`Missing attribute "details" in <control-templates>.`);
    } else {
        for (const key of Object.keys(e.attributes)) {
            switch (key) {
                case 'details': {
                    const value = e.attributes[key];
                    switch (value) {
                        case 'true': {
                            details = true;
                            break;
                        }
                        case 'false': {
                            details = false;
                            break;
                        }
                        default: {
                            throw new Error(`Attribute details in <control-templates> must be a legal boolean value.`);
                        }
                    }
                    break;
                }
                default:
                    throw new Error(`Unrecognized attribute ${key} in <control-templates>.`);
            }
        }
    }
    return {
        kind: 'Plugin',
        plugin: {
            kind: 'ControlTemplatesPlugin',
            details
        }
    };
}

function generateListItemForCT(hierarchy: Hierarchy, details: boolean): a.ContentListItem {
    const content: a.Content[] = [];

    if (details) {
        if (propertiesMetadata[hierarchy.controlTemplate] === undefined) {
            throw new Error(`Missing <control-template-document> for ${hierarchy.controlTemplate}.`);
        }
        content.push({
            kind: 'Strong',
            content: [{
                kind: 'PageLink',
                href: `/gacui/components/ctemplates/${hierarchy.controlTemplate}.html`,
                content: [{ kind: 'Text', text: `<${hierarchy.controlTemplate}/>` }]
            }]
        });

        const themeNames = Object.keys(themeNamesMetadata).filter((themeName: string) => themeNamesMetadata[themeName] === hierarchy.controlTemplate);
        if (themeNames.length > 0) {
            content.push(... (
                themeNames
                    .map((themeName: string): a.Content => ({
                        kind: 'Text',
                        text: themeName
                    }))
                    .reduce<a.Content[]>(
                        (previous: a.Content[], current: a.Content, index: number) => {
                            if (index === 0) {
                                return previous.concat({ kind: 'Text', text: ': ' }, current);
                            } else {
                                return previous.concat({ kind: 'Text', text: ', ' }, current);
                            }
                        },
                        []
                    )
            ));
        }
    } else {
        content.push({ kind: 'Text', text: `<${hierarchy.controlTemplate}/>` });
    }

    if (hierarchy.children.length > 0) {
        content.push({
            kind: 'List',
            ordered: false,
            items: hierarchy.children.map((child: Hierarchy) => generateListItemForCT(child, details))
        });
    }

    return {
        kind: 'ContentListItem',
        content
    };
}

export function renderControlTemplates(plugin: {}): a.Content[] {
    const ctp = (<ControlTemplatesPlugin>plugin);
    return [{
        kind: 'List',
        ordered: false,
        items: [generateListItemForCT(hierarchyRoot, ctp.details)]
    }];
}
