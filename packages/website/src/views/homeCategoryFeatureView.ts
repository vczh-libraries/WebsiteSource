// tslint:disable:no-submodule-imports
import { Article } from 'gaclib-article/lib/src/interfaces';
import { renderArticle } from 'gaclib-article/lib/src/rendering';
import { html, render } from 'lit-html';

export const viewExport = {
    renderView(model: {}, target: Element): void {
        const featureArticle = <Article>window['MVC-Resources.featureArticle'];
        const htmlTemplate = html`
${renderArticle(featureArticle)}
`;
        render(htmlTemplate, target);
    }
};
