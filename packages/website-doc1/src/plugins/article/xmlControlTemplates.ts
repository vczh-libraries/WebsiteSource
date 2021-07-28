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
}

export function parseControlTemplates(e: Element): a.Plugin {
    return {
        kind: 'Plugin',
        plugin: {
            kind: 'ControlTemplatesPlugin'
        }
    };
}

function generateListItemForCT(controlTemplate: string): a.ContentListItem {
    const content: a.Content[] = [];
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

    const deriveds = Object.keys(hierarchyMetadata).filter((derived: string) => hierarchyMetadata[derived] === controlTemplate);
    if (deriveds.length > 0) {
        content.push({
            kind: 'List',
            ordered: false,
            items: deriveds.map(generateListItemForCT)
        });
    }

    return {
        kind: 'ContentListItem',
        content
    };
}

export function renderControlTemplates(): a.Content[] {
    return [{
        kind: 'List',
        ordered: false,
        items: [generateListItemForCT('ControlTemplate')]
    }];
}
