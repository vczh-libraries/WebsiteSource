import { html, render } from 'lit-html';

export const viewExport = {
    renderView(model: {}, target: Element): void {
        const htmlTemplate = html`
<table class="DirectoryTable">
    <tr>
        <td class="TreeView" valign="top">
            <strong>The reference directory is under construction</strong>
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
