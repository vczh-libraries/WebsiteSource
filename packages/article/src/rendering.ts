import { html, TemplateResult } from 'lit-html';
import * as a from './interfaces';

function renderListContent(list: a.List): TemplateResult {
    return html`${
        list
            .items
            .map((value: a.ContentListItem | a.ParagraphListItem) => {
                if (value.kind === 'ContentListItem') {
                    return html`<li>${renderContent(value.content)}</li>`;
                } else {
                    return html`<li>${value.paragraphs.map(renderParagraph)}</li>`;
                }
            })
        }`;
}

function renderLink(href: string, content: TemplateResult): TemplateResult {
    return html`<a href="${href}" target="${href.startsWith('.') || href.startsWith('/') ? '_self' : '_blank'}">${content}</a>`;
}

function renderContent(content: a.Content[]): TemplateResult {
    return html`${
        content
            .map((value: a.Content) => {
                switch (value.kind) {
                    case 'PageLink':
                        return renderLink(value.href, renderContent(value.content));
                    case 'MultiPageLink': {
                        if (value.href.length < 2) {
                            throw new Error('There must be at least two <a> in <as>.');
                        }
                        const header = renderLink(value.href[0], renderContent(value.content));
                        const tails = value.href.slice(1).map((href: string, index: number) =>
                            renderLink(href, html`[${index + 2}]`)
                        );
                        return html`${header}<sub>(... and ${tails})</sub>`;
                    }
                    case 'Name':
                        return html`<span class="name">${value.text}</span>`;
                    case 'Image':
                        if (value.caption === undefined) {
                            return html`<img src="${value.src}">`;
                        } else {
                            return html`<figure><img src="${value.src}"><figcaption>${value.caption}</figcaption></figure>`;
                        }
                    case 'List':
                        if (value.ordered) {
                            return html`<ol>${renderListContent(value)}</ol>`;
                        } else {
                            return html`<ul>${renderListContent(value)}</ul>`;
                        }
                    case 'Strong':
                        return html`<strong>${renderContent(value.content)}</strong>`;
                    case 'Emphasise':
                        return html`<em>${renderContent(value.content)}<em>`;
                    case 'Program': {
                        const htmlCode = html`<pre class="code"><code data-project="${value.project === undefined ? '' : value.project}" data-language="${value.language === undefined ? '' : value.language}">${value.code}</code></pre>`;
                        if (value.output !== undefined) {
                            return html`${htmlCode}<div>Output:</div><pre class="code"><code>${value.output.join('\n')}</code></pre>`;
                        } else {
                            return htmlCode;
                        }
                    }
                    case 'Plugin':
                        throw new Error('Plugin must be processed by calling "consumePlugin" before calling "renderArticle".');
                    default:
                        return value.text;
                }
            })
        }`;
}

function renderParagraph(paragraph: a.Paragraph): TemplateResult {
    return html`<p>${renderContent(paragraph.content)}</p>`;
}

function renderHeader(level: number, content: TemplateResult): TemplateResult {
    switch (level) {
        case 1: return html`<h1>${content}</h1>`;
        case 2: return html`<h2>${content}</h2>`;
        case 3: return html`<h3>${content}</h3>`;
        case 4: return html`<h4>${content}</h4>`;
        case 5: return html`<h5>${content}</h5>`;
        default: return html`<h6>${content}</h6>`;
    }
}

function renderIndex(topic: a.Topic): TemplateResult | string {
    const subTopics = topic.content.filter((value: a.Topic | a.Paragraph) => value.kind === 'Topic');
    if (subTopics.length === 0) {
        return '';
    } else {
        return html`<ul>${subTopics.map((value: a.Topic) => html`<li><a href="#${getAnchorOfTopic(value)}">${value.title}</a>${renderIndex(value)}</li>`)}</ul>`;
    }
}

function renderTopic(topic: a.Topic, level: number, prefix: string | undefined, buildIndex: boolean): TemplateResult {
    let topicIndex = 0;
    return html`
${
        renderHeader(
            level,
            html`
<a id="${getAnchorOfTopic(topic)}"></a>
${prefix === undefined ? '' : `${prefix} `}${topic.title}
        `)
        }
${buildIndex ? html`<div class="index">${renderIndex(topic)}</div>` : ''}
${
        topic
            .content
            .map((value: a.Topic | a.Paragraph) => {
                if (value.kind === 'Topic') {
                    let newPrefix = prefix;
                    if (newPrefix !== undefined) {
                        newPrefix += `${++topicIndex}.`;
                    }
                    return renderTopic(value, level + 1, newPrefix, false);
                } else {
                    return renderParagraph(value);
                }
            })
        }
`;
}

function getAnchorOfTopic(topic: a.Topic): string {
    if (topic.anchor === undefined) {
        return topic.title.split(/[^a-zA-Z0-9]+/).join('-');
    } else {
        return topic.anchor;
    }
}

export function renderArticle(article: a.Article): TemplateResult {
    return html`<div class="article">${renderTopic(article.topic, 1, (article.numberBeforeTitle ? '' : undefined), article.index)}<div>`;
}
