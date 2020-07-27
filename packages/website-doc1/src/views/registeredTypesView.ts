// tslint:disable:no-submodule-imports
import { html, render } from 'lit-html';

export interface RegisteredType {
    kind: string;
    name: string;
    cpp: string;
}

export interface RegisteredTypesInfo {
    types: RegisteredType[];
}

export const viewExport = {
    renderView(model: {}, target: Element): void {
        const info = <RegisteredTypesInfo>window['MVC-Resources.registeredTypesInfo'];
        const htmlTemplate = html`
${JSON.stringify(info, undefined, 4)}
`;
        render(htmlTemplate, target);
    }
};
