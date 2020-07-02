// tslint:disable:no-submodule-imports
import { html, render } from 'lit-html';

export const viewExport = {
    renderView(model: {}, target: Element): void {
        const document = <string>window['MVC-Resources.document'];
        const htmlTemplate = html`
<h1>XML Document</h1>
${document}
`;
        render(htmlTemplate, target);
    }
};
