import { existsSync, readFileSync, writeFileSync } from 'fs';
import * as a from 'gaclib-article';
import * as path from 'path';
import { Element } from 'xml-js';

interface ThemeNamesMetadata {
    [themeName: string]: string;
}

interface HierarchyMetadata {
    [derivedControlTemplate: string]: string;
}

interface PropertyMetadata {
    input?: string[];
    output?: string[];
    exchange?: string[];
}

interface PropertiesMetadata {
    [controlTemplate: string]: PropertyMetadata;
}

const dirRoot = path.join(__dirname, '../../../src/articles/gacui/components/ctemplates');
const themeNamesMetadata = <ThemeNamesMetadata>JSON.parse(readFileSync(path.join(dirRoot, 'metadata/themeNames.json'), { encoding: 'utf-8' }));
const hierarchyMetadata = <HierarchyMetadata>JSON.parse(readFileSync(path.join(dirRoot, 'metadata/hierarchy.json'), { encoding: 'utf-8' }));
const propertiesMetadata = <PropertiesMetadata>JSON.parse(readFileSync(path.join(dirRoot, 'metadata/properties.json'), { encoding: 'utf-8' }));

interface Hierarchy {
    controlTemplate: string;
    documented: boolean;
    children: Hierarchy[];
}

function createHierarchy(controlTemplate: string): Hierarchy {
    return {
        controlTemplate,
        documented: false,
        children: []
    };
}

const hierarchyRoot: Hierarchy = createHierarchy('ControlTemplate');
const hierarchyIndex: { [controlTemplate: string]: Hierarchy } = {};

function initializeHierarchy(hierarchy: Hierarchy): void {
    hierarchyIndex[hierarchy.controlTemplate] = hierarchy;
    const deriveds = Object.keys(hierarchyMetadata).filter((derived: string) => hierarchyMetadata[derived] === hierarchy.controlTemplate);
    for (const derived of deriveds) {
        const child = createHierarchy(derived);
        hierarchy.children.push(child);
        initializeHierarchy(child);
    }
}

function initializeEntry(): void {
    function hierarchyToEntry(hierarchy: Hierarchy, indent: string): string {
        if (hierarchy.children.length > 0) {
            return `${indent}<control-template name="&lt;${hierarchy.controlTemplate}&gt;" file="${hierarchy.controlTemplate}">
${hierarchy.children.map((child: Hierarchy) => hierarchyToEntry(child, `${indent}  `)).join('\r\n')}
${indent}</control-template>`;
        } else {
            return `${indent}<control-template name="&lt;${hierarchy.controlTemplate}&gt;" file="${hierarchy.controlTemplate}"/>`;
        }
    }

    const entryPath = path.join(dirRoot, 'entry.xml');
    const entryContent = `<reference>
${hierarchyToEntry(hierarchyRoot, '  ')}
</reference>`;
    if (!existsSync(entryPath) || readFileSync(entryPath, { encoding: 'utf-8' }) !== entryContent) {
        writeFileSync(entryPath, entryContent, { encoding: 'utf-8' });
    }
}

function initializeDocs(): void {
    function propsToContent(props: string[] | undefined): string {
        if (props === undefined || props.length === 0) {
            return '';
        } else {
            return props.map((prop: string) => `
    <prop name="${prop}">
    </prop>`).join('\r\n');
        }
    }

    for (const ct of Object.keys(hierarchyIndex)) {
        const ctPath = path.join(dirRoot, `documents/${ct}.xml`);
        if (!existsSync(ctPath)) {
            const props = propertiesMetadata[ct];
            const ctContent = `<control-template-document name="${ct}">
  <inputs>${propsToContent(props.input)}
  </inputs>
  <output>${propsToContent(props.output)}
  </output>
  <exchange>${propsToContent(props.exchange)}
  </exchange>
</control-template-document>`;
            writeFileSync(ctPath, ctContent, { encoding: 'utf-8' });
        }
    }
}

initializeHierarchy(hierarchyRoot);
initializeEntry();
initializeDocs();

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
        content.push({
            kind: 'Strong',
            content: [{ kind: 'Text', text: `<${hierarchy.controlTemplate}/>` }]
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
