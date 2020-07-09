// tslint:disable:no-submodule-imports
import { Article } from 'gaclib-article/lib/src/interfaces';
import { renderArticle } from 'gaclib-article/lib/src/rendering';
import { html, render } from 'lit-html';

export const viewExport = {
    renderView(model: {}, target: Element): void {
        const homeArticle = <Article>window['MVC-Resources.homeArticle'];
        const htmlTemplate = html`
${renderArticle(homeArticle)}
<div id="homeViewContainer"/>
`;
        render(htmlTemplate, target);
    }
};
