// tslint:disable:no-submodule-imports
import { Article } from 'gaclib-article/lib/src/interfaces';
import { renderArticle } from 'gaclib-article/lib/src/rendering';
import { html, render, TemplateResult } from 'lit-html';

export interface FeatureItem {
    image: string;
    href: string;
    article: Article;
}

export interface FeatureList {
    title: string;
    features: FeatureItem[];
}

export const viewExport = {
    renderView(model: {}, target: Element): void {
        const featureList = <FeatureList>window['MVC-Resources.featureList'];

        const htmlTemplate = html`
<table class="FeatureTable">${
            featureList.features.map((fitem: FeatureItem): TemplateResult => {
                return html`
                    <tr>
                        <td>
                            <a href="/home/${fitem.href}"><img src="${fitem.image}"/></a>
                        </td>
                        <td valign="top">
                            <div>${renderArticle(fitem.article)}</div>
                        </td>
                    </tr>
`;
            })}
</table>
`;
        render(htmlTemplate, target);
    }
};
