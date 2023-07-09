import { html, render, TemplateResult } from 'lit-html';

export interface DirectoryNode {
    icon: ' ' | '+' | '-';
    name: string;
    selected: boolean;
    path?: string[];
    subNodes?: DirectoryNode[];
}

export interface DirectoryInfo {
    subNodes: DirectoryNode[];
}

function icon(i: ' ' | '+' | '-'): TemplateResult {
    switch (i) {
        case '+': return html`<code>+&nbsp;</code>`;
        case '-': return html`<code>-&nbsp;</code>`;
        default: return html`<code>&nbsp;&nbsp;</code>`;
    }
}

function renderDirectory(dinfo: DirectoryInfo, hrefPrefix: string, dnodes: DirectoryNode[]): TemplateResult {
    return html`${
        dnodes.map((dnode: DirectoryNode) => {
            const subHtml = dnode.subNodes === undefined ? undefined : html`<div class="Children">${renderDirectory(dinfo, hrefPrefix, dnode.subNodes)}</div>`;
            if (dnode.selected) {
                return html`<div class="DirectoryNode">${icon(dnode.icon)}<span class="Selected">${dnode.name}</span></div>${subHtml}`;
            } else if (dnode.path === undefined) {
                return html`<div class="DirectoryNode">${icon(dnode.icon)}<span>${dnode.name}</span></div>${subHtml}`;
            } else {
                return html`<div class="DirectoryNode">${icon(dnode.icon)}<a href="${hrefPrefix}/${dnode.path.join('/')}.html">${dnode.name}</a></div>${subHtml}`;
            }
        })
        }`;
}

export const viewExport = {
    renderView(model: {}, target: Element): void {
        const dinfo = <DirectoryInfo>window['MVC-Resources.directoryInfo'];
        const hrefPrefix = <string>window['MVC-Resources.hrefPrefix'];
        const htmlTemplate = html`
<table class="DirectoryTable">
    <tr>
        <td valign="top">
            <div class="TreeView">
                <h1>Index (towards 2.0)</h1>
                ${renderDirectory(dinfo, hrefPrefix, dinfo.subNodes)}
            </div>
        </td>
        <td valign="top">
            <div class="ContentView">
                <div id="directoryViewContainer"></div>
            </div>
        </td>
    </tr>
</table>
`;
        render(htmlTemplate, target);
    }
};
