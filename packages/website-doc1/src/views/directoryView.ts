import { html, render, TemplateResult } from 'lit-html';

export interface DirectoryNode {
    name: string;
    selected: boolean;
    path?: string[];
    subNodes?: DirectoryNode[];
}

export interface DirectoryInfo {
    subNodes: DirectoryNode[];
}

function renderDirectory(dinfo: DirectoryInfo, hrefPrefix: string, dnodes: DirectoryNode[]): TemplateResult {
    return html`${
        dnodes.map((dnode: DirectoryNode) => {
            const subHtml = dnode.subNodes === undefined ? undefined : html`<div class="Children">${renderDirectory(dinfo, hrefPrefix, dnode.subNodes)}</div>`;
            if (dnode.selected) {
                return html`<div class="DirectoryNode Selected">${dnode.name}</div>${subHtml}`;
            } else if (dnode.path === undefined) {
                return html`<div class="DirectoryNode">${dnode.name}</div>${subHtml}`;
            } else {
                return html`<a class="DirectoryNode" href="${hrefPrefix}/${dnode.path.join('/')}.html">${dnode.name}</a>${subHtml}`;
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
                <h1>Index</h1>
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
