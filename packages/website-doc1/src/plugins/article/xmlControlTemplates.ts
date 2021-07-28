import { readFileSync } from 'fs';
import * as a from 'gaclib-article';
import * as path from 'path';
import { Element } from 'xml-js';

interface ThemeNamesMetadata {
    [themeName: string]: string;
}

interface HierarchyMetadata {
    [derivedControlTemplate: string]: string;
}

const themeNamesMetadata = <ThemeNamesMetadata>JSON.parse(readFileSync(path.join(__dirname, '../../../src/articles/gacui/components/ctemplates/metadata/themeNames.json'), { encoding: 'utf-8' }));
const hierarchyMetadata = <HierarchyMetadata>JSON.parse(readFileSync(path.join(__dirname, '../../../src/articles/gacui/components/ctemplates/metadata/hierarchy.json'), { encoding: 'utf-8' }));

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

function generateListItemForCT(controlTemplate: string, details: boolean): a.ContentListItem {
    const content: a.Content[] = [];

    if (details) {
        content.push({
            kind: 'Strong',
            content: [{ kind: 'Text', text: `<${controlTemplate}/>` }]
        });

        const themeNames = Object.keys(themeNamesMetadata).filter((themeName: string) => themeNamesMetadata[themeName] === controlTemplate);
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
        content.push({ kind: 'Text', text: `<${controlTemplate}/>` });
    }

    const deriveds = Object.keys(hierarchyMetadata).filter((derived: string) => hierarchyMetadata[derived] === controlTemplate);
    if (deriveds.length > 0) {
        content.push({
            kind: 'List',
            ordered: false,
            items: deriveds.map((derived: string) => generateListItemForCT(derived, details))
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
        items: [generateListItemForCT('ControlTemplate', ctp.details)]
    }];
}
