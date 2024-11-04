import { existsSync, readFileSync, writeFileSync } from 'fs';
import * as path from 'path';

export interface ThemeNamesMetadata {
    [themeName: string]: string;
}

export interface HierarchyMetadata {
    [derivedControlTemplate: string]: string;
}

export interface PropertyMetadata {
    inputs?: string[];
    outputs?: string[];
    exchanges?: string[];
}

export interface PropertiesMetadata {
    [controlTemplate: string]: PropertyMetadata;
}

const __dirname = path.resolve('./lib/plugins/control-template');
const dirRoot = path.join(__dirname, '../../../src/articles/gacui/components/ctemplates');
export const themeNamesMetadata = <ThemeNamesMetadata>JSON.parse(readFileSync(path.join(dirRoot, 'metadata/themeNames.json'), { encoding: 'utf-8' }));
export const hierarchyMetadata = <HierarchyMetadata>JSON.parse(readFileSync(path.join(dirRoot, 'metadata/hierarchy.json'), { encoding: 'utf-8' }));
export const propertiesMetadata = <PropertiesMetadata>JSON.parse(readFileSync(path.join(dirRoot, 'metadata/properties.json'), { encoding: 'utf-8' }));

export interface Hierarchy {
    parent?: Hierarchy;
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

export const hierarchyRoot: Hierarchy = createHierarchy('ControlTemplate');
export const hierarchyIndex: { [controlTemplate: string]: Hierarchy } = {};

function initializeHierarchy(hierarchy: Hierarchy): void {
    hierarchyIndex[hierarchy.controlTemplate] = hierarchy;
    const deriveds = Object.keys(hierarchyMetadata).filter((derived: string) => hierarchyMetadata[derived] === hierarchy.controlTemplate);
    for (const derived of deriveds) {
        const child = createHierarchy(derived);
        child.parent = hierarchy;
        hierarchy.children.push(child);
        initializeHierarchy(child);
    }
}

function initializeEntry(): void {
    function hierarchyToEntry(hierarchy: Hierarchy, indent: string): string {
        if (hierarchy.children.length > 0) {
            return `${indent}<control-template ct="${hierarchy.controlTemplate}" file="${hierarchy.controlTemplate}">
${hierarchy.children.map((child: Hierarchy) => hierarchyToEntry(child, `${indent}  `)).join('\r\n')}
${indent}</control-template>`;
        } else {
            return `${indent}<control-template ct="${hierarchy.controlTemplate}" file="${hierarchy.controlTemplate}"/>`;
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
  <introduction>
  </introduction>
  <inputs>${propsToContent(props.inputs)}
  </inputs>
  <outputs>${propsToContent(props.outputs)}
  </outputs>
  <exchanges>${propsToContent(props.exchanges)}
  </exchanges>
  <samples>
  </samples>
</control-template-document>`;
            writeFileSync(ctPath, ctContent, { encoding: 'utf-8' });
        }
    }
}

initializeHierarchy(hierarchyRoot);
initializeEntry();
initializeDocs();
