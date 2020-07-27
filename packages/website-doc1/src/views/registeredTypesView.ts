// tslint:disable:no-submodule-imports
import { html, render } from 'lit-html';

export interface RegisteredType {
    kind: string;
    name: string;
    cpp: string;
}

export interface RegisteredTypesInfo {
    types: RegisteredType[];
}

interface TypeItem {
    name: string;
    cpp: string;
}

interface TypeCategory {
    name: string;
    items: TypeItem[];
}

interface TypeCppNs {
    name: string;
    items: TypeCategory[];
}

interface TypeTdNs {
    name: string;
    items: TypeCppNs[];
}

function sortTypeCategory(rts: RegisteredType[]): TypeCategory[] {
    const byCategory: { [key: string]: TypeItem[] } = {};
    for (const rt of rts) {
        const nameIndex = rt.name.lastIndexOf('::');
        const cppIndex = rt.cpp.lastIndexOf('::');
        const item: TypeItem = {
            name: nameIndex === -1 ? rt.name : rt.name.substr(nameIndex + 2),
            cpp: cppIndex === -1 ? rt.cpp : rt.cpp.substr(cppIndex + 2)
        };
        if (byCategory[rt.kind] === undefined) {
            byCategory[rt.kind] = [];
        }
        byCategory[rt.kind].push(item);
    }
    return Object.keys(byCategory).sort().map((key: string): TypeCategory => ({
        name: key,
        items: byCategory[key].sort((a: TypeItem, b: TypeItem) => a.name.localeCompare(b.name))
    }));
}

function sortTypeCppNs(rts: RegisteredType[]): TypeCppNs[] {
    const byCppNs: { [key: string]: RegisteredType[] } = {};
    for (const rt of rts) {
        const index = rt.cpp.lastIndexOf('::');
        const ns = index === -1 ? '' : rt.cpp.substr(0, index);
        if (byCppNs[ns] === undefined) {
            byCppNs[ns] = [];
        }
        byCppNs[ns].push(rt);
    }
    return Object.keys(byCppNs).sort().map((key: string): TypeCppNs => ({
        name: key.startsWith('::') ? key : `::${key}`,
        items: sortTypeCategory(byCppNs[key])
    }));
}

function sortTypeTdNs(rts: RegisteredType[]): TypeTdNs[] {
    const byTdNs: { [key: string]: RegisteredType[] } = {};
    for (const rt of rts) {
        const index = rt.name.lastIndexOf('::');
        const ns = index === -1 ? '' : rt.name.substr(0, index);
        if (byTdNs[ns] === undefined) {
            byTdNs[ns] = [];
        }
        byTdNs[ns].push(rt);
    }
    return Object.keys(byTdNs).sort().map((key: string): TypeTdNs => ({
        name: key.startsWith('::') ? key : `::${key}`,
        items: sortTypeCppNs(byTdNs[key])
    }));
}

export const viewExport = {
    renderView(model: {}, target: Element): void {
        const info = <RegisteredTypesInfo>window['MVC-Resources.registeredTypesInfo'];
        const tdns = sortTypeTdNs(info.types);
        const htmlTemplate = html`
<pre>
${JSON.stringify(tdns, undefined, 4).split('\n').map((s: string) => html`${s}<br>`)}
</pre>
`;
        render(htmlTemplate, target);
    }
};
