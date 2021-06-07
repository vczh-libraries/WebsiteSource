import { html, TemplateResult } from 'lit-html';
import * as a from './interfaces';

export interface RenderArticleOptions {
    hrefPrefix: string | undefined;
    buildIndex: boolean;
}

function renderListContent(list: a.List, options: RenderArticleOptions): TemplateResult {
    return html`${
        list
            .items
            .map((value: a.ContentListItem | a.ParagraphListItem) => {
                if (value.kind === 'ContentListItem') {
                    return html`<li>${renderContent(value.content, options)}</li>`;
                } else {
                    return html`<li>${value.paragraphs.map((r: a.Paragraph) => renderParagraph(r, options))}</li>`;
                }
            })
        }`;
}

function rewriteLink(href: string, options: RenderArticleOptions): string {
    if (href.startsWith('//')) {
        return href.substr(1);
    } else if (href.startsWith('/')) {
        return (options.hrefPrefix === undefined ? '' : options.hrefPrefix) + href;
    } else {
        return href;
    }
}

function renderLink(href: string, options: RenderArticleOptions, content: TemplateResult): TemplateResult {
    const targetAttr = href.startsWith('.') || href.startsWith('/') ? '_self' : '_blank';
    const hrefAttr = rewriteLink(href, options);
    return html`<a href="${hrefAttr}" target="${targetAttr}">${content}</a>`;
}

function renderContent(content: a.Content[], options: RenderArticleOptions): TemplateResult {
    return html`${
        content
            .map((value: a.Content) => {
                switch (value.kind) {
                    case 'PageLink':
                        return renderLink(value.href, options, renderContent(value.content, options));
                    case 'MultiPageLink': {
                        if (value.href.length < 2) {
                            throw new Error('There must be at least two <a> in <as>.');
                        }
                        const header = renderLink(value.href[0], options, renderContent(value.content, options));
                        const tails = value.href.slice(1).map((href: string, index: number) =>
                            renderLink(href, options, html`[${index + 2}]`)
                        );
                        return html`${header}<sub>(... and ${tails})</sub>`;
                    }
                    case 'Name':
                        return html`<span class="name">${value.text}</span>`;
                    case 'Image':
                        if (value.caption === undefined) {
                            return html`<img src="${rewriteLink(value.src, options)}">`;
                        } else {
                            return html`<figure><img src="${rewriteLink(value.src, options)}"><figcaption>${value.caption}</figcaption></figure>`;
                        }
                    case 'List':
                        if (value.ordered) {
                            return html`<ol>${renderListContent(value, options)}</ol>`;
                        } else {
                            return html`<ul>${renderListContent(value, options)}</ul>`;
                        }
                    case 'Strong':
                        return html`<strong>${renderContent(value.content, options)}</strong>`;
                    case 'Emphasise':
                        return html`<em>${renderContent(value.content, options)}<em>`;
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

function renderParagraph(paragraph: a.Paragraph, options: RenderArticleOptions): TemplateResult {
    return html`<p>${renderContent(paragraph.content, options)}</p>`;
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

function renderTopic(topic: a.Topic, level: number, prefix: string | undefined, topTopic: boolean, options: RenderArticleOptions): TemplateResult {
    let topicIndex = 0;
    return html`
${
        renderHeader(
            level,
            html`
<a id="${getAnchorOfTopic(topic)}"></a>
${prefix === undefined ? '' : `${prefix} `}<span class="subtitle">${topic.title}</span>
        `)
        }
${options.buildIndex && topTopic ? html`<div class="index">${renderIndex(topic)}</div>` : ''}
${
        topic
            .content
            .map((value: a.Topic | a.Paragraph) => {
                if (value.kind === 'Topic') {
                    let newPrefix = prefix;
                    if (newPrefix !== undefined) {
                        newPrefix += `${++topicIndex}.`;
                    }
                    return renderTopic(value, level + 1, newPrefix, false, options);
                } else {
                    return renderParagraph(value, options);
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

export function renderArticle(article: a.Article, options?: RenderArticleOptions): TemplateResult {
    const renderArticleOptions: RenderArticleOptions = {
        hrefPrefix: options?.hrefPrefix,
        buildIndex: article.index
    };
    return html`<div class="article">${renderTopic(article.topic, 1, (article.numberBeforeTitle ? '' : undefined), true, renderArticleOptions)}<div>
<script lang="javascript">
const highlightSubtitleByHash = function() {
    const topics = document.getElementsByClassName("subtitle");
    if (topics) {
        for (const topic of topics) {
            topic.classList.remove("highlight");
        }
    }
    const anchor = document.getElementById(window.location.hash.substr(1));
    if (anchor) {
        const topic = anchor.parentElement.getElementsByClassName("subtitle")[0];
        topic.classList.add("highlight");
    }
}
window.addEventListener("hashchange", highlightSubtitleByHash, false);
highlightSubtitleByHash();
</script>`;
}
