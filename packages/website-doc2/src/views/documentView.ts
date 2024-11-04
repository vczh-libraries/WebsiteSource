// tslint:disable:no-submodule-imports
import { Article } from 'gaclib-article/lib/src/interfaces';
import { renderArticle } from 'gaclib-article/lib/src/rendering.js';
import { html, render } from 'lit-html';

export const viewExport = {
    renderView(model: {}, target: Element): void {
        const article = <Article>window['MVC-Resources.documentArticle'];
        const hrefPrefix = <string>window['MVC-Resources.hrefPrefix'];
        const htmlTemplate = html`
${renderArticle(article, { hrefPrefix, buildIndex: article.index })}
`;
        render(htmlTemplate, target);
    }
};
