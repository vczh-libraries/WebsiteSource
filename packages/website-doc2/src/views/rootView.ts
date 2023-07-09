import { html, render } from 'lit-html';

export const viewExport = {
    renderView(model: {}, target: Element): void {
        const hrefPrefix = <string>window['MVC-Resources.hrefPrefix'];
        const htmlTemplate = html`
<table class="RootTable">
    <tr>
        <td align="center" valign="top">
            <table class="ArticleTable" cellpadding="0" cellspacing="0">
                <tr>
                    <td class="NavigateHeader" colspan="6" align="left">
                        <a href="/"><img src="${hrefPrefix}/logo.gif" /></a>
                    </td>
                </tr>
                <tr>
                    <td align="left" valign="top" colspan="6">
                        <div id="rootViewContainer"></div>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
`;
        render(htmlTemplate, target);
    }
};
