// tslint:disable:no-submodule-imports
import { html, render } from 'lit-html';

export const viewExport = {
    renderView(model: {}, target: Element): void {
        const htmlTemplate = html`
This page is under construction.
`;
        render(htmlTemplate, target);
    }
};
