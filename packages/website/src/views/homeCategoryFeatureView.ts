// tslint:disable:no-submodule-imports
import { Article, Image, Paragraph, Topic } from 'gaclib-article/lib/src/interfaces';
import { renderArticle } from 'gaclib-article/lib/src/rendering';
import { html, render, TemplateResult } from 'lit-html';

interface FeatureItem {
    image: string;
    href: string;
    topic: Topic;
}

export const viewExport = {
    renderView(model: {}, target: Element): void {
        const featureArticle = <Article>window['MVC-Resources.featureArticle'];
        const featureList = (<Topic[]>featureArticle.topic.content.slice(1)).map((t: Topic, index: number): FeatureItem => {
            const image = (<Image>(<Paragraph>featureArticle.topic.content[0]).content[index]);
            return {
                image: image.src,
                href: <string>image.caption,
                topic: t
            };
        });

        const htmlTemplate = html`
<table class="FeatureTable">${
            featureList.map((fitem: FeatureItem): TemplateResult => {
                return html`
                    <tr>
                        <td>
                            <a href="/home/${fitem.href}"><img src="${fitem.image}"/></a>
                        </td>
                        <td valign="top">
                            <div>${renderArticle({ index: false, numberBeforeTitle: false, topic: fitem.topic })}</div>
                        </td>
                    </tr>
`;
            })}
</table>
`;
        render(htmlTemplate, target);
    }
};
