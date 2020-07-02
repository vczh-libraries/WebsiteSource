// tslint:disable:no-submodule-imports
import { html, render } from 'lit-html';

export const viewExport = {
    renderView(model: {}, target: Element): void {
        const documentArticle = <string>window['MVC-Resources.documentArticle'];
        const htmlTemplate = html`
<h1>XML Document</h1>
${documentArticle}
`;
        render(htmlTemplate, target);
    }
};
