// tslint:disable:no-submodule-imports
import { Article } from 'gaclib-article/lib/src/interfaces.js';
import { renderArticle } from 'gaclib-article/lib/src/rendering.js';
import { html, render } from 'lit-html';

export const viewExport = {
    renderView(model: {}, target: HTMLElement): void {
        const article = <Article>(<Record<string, unknown>><unknown>window)['MVC-Resources.documentArticle'];
        const hrefPrefix = <string>(<Record<string, unknown>><unknown>window)['MVC-Resources.hrefPrefix'];
        const htmlTemplate = html`
${renderArticle(article, { hrefPrefix, buildIndex: article.index })}
`;
        render(htmlTemplate, target);
    }
};
