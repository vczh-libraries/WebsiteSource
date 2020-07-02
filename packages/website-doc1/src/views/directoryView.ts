import { html, render, TemplateResult } from 'lit-html';

export interface DirectoryNode {
    name: string;
    selected: boolean;
    path?: string[];
    subNodes?: DirectoryNode[];
}

export interface DirectoryInfo {
    pathPrefix: string;
    subNodes: DirectoryNode[];
}

function renderDirectory(dinfo: DirectoryInfo, dnodes: DirectoryNode[]): TemplateResult {
    return html`${
        dnodes.map((dnode: DirectoryNode) => {
            const subHtml = dnode.subNodes === undefined ? undefined : html`<div class="Children">${renderDirectory(dinfo, dnode.subNodes)}</div>`;
            if (dnode.selected) {
                return html`<div class="DirectoryNode Selected">${dnode.name}</div>${subHtml}`;
            } else if (dnode.path === undefined) {
                return html`<div class="DirectoryNode">${dnode.name}</div>${subHtml}`;
            } else {
                return html`<a class="DirectoryNode" href="${dinfo.pathPrefix}/${dnode.path.join('/')}.html">${dnode.name}</a>${subHtml}`;
            }
        })
        }`;
}

export const viewExport = {
    renderView(model: {}, target: Element): void {
        const dinfo = <DirectoryInfo>window['MVC-Resources.directoryInfo'];
        const htmlTemplate = html`
<table class="DirectoryTable">
    <tr>
        <td class="TreeView" valign="top">
            <h1>Index</h1>
            ${renderDirectory(dinfo, dinfo.subNodes)}
        </td>
        <td class="ContentView" valign="top">
            <div id="directoryViewContainer"/>
        </td>
    </tr>
</table>
`;
        render(htmlTemplate, target);
    }
};
