// tslint:disable:no-submodule-imports
import { html, render } from 'lit-html';

export const viewExport = {
    renderView(model: {}, target: HTMLElement): void {
        const namespaceName = <string>(<Record<string, unknown>><unknown>window)['MVC-Resources.namespaceName'];
        const htmlTemplate = html`
<h1>namespace ${namespaceName}</h1>
<p>Please checkout members of this namespace in <strong>Index</strong>.</p>
`;
        render(htmlTemplate, target);
    }
};
