// tslint:disable:no-submodule-imports
import { html, render } from 'lit-html';

export const viewExport = {
    renderView(model: {}, target: HTMLElement): void {
        const htmlTemplate = html`
<h1>This page is being generated ...</h1>
`;
        render(htmlTemplate, target);
    }
};
