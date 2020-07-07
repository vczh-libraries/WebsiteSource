import { html, TemplateResult } from 'lit-html';
import * as a from './interfaces';

type PluginConverter = (plugin: {}) => a.Content[];

function renderListContent(list: a.List, pluginConverter: PluginConverter): TemplateResult {
    return html`${
        list
            .items
            .map((value: a.ContentListItem | a.ParagraphListItem) => {
                if (value.kind === 'ContentListItem') {
                    return html`<li>${renderContent(value.content, pluginConverter)}</li>`;
                } else {
                    return html`<li>${value.paragraphs.map((p: a.Paragraph) => renderParagraph(p, pluginConverter))}</li>`;
                }
            })
        }`;
}

function renderContent(content: a.Content[], pluginConverter: PluginConverter): TemplateResult {
    return html`${
        content
            .map((value: a.Content) => {
                switch (value.kind) {
                    case 'PageLink':
                        return html`<a href="${value.href}" target="${value.href.startsWith('.') ? '_self' : '_blank'}">${renderContent(value.content, pluginConverter)}</a>`;
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
                            return html`<ol>${renderListContent(value, pluginConverter)}</ol>`;
                        } else {
                            return html`<ul>${renderListContent(value, pluginConverter)}</ul>`;
                        }
                    case 'Strong':
                        return html`<strong>${renderContent(value.content, pluginConverter)}</strong>`;
                    case 'Emphasise':
                        return html`<em>${renderContent(value.content, pluginConverter)}<em>`;
                    case 'Program':
                        if (value.output !== undefined) {
                            throw new Error('Program with output is not supported yet.');
                        }
                        return html`<pre class="code"><code data-project="${value.project === undefined ? '' : value.project}" data-language="${value.language === undefined ? '' : value.language}">${value.code}</code></pre>`;
                    case 'Plugin':
                        return renderContent(pluginConverter(value.plugin), pluginConverter);
                    default:
                        return value.text;
                }
            })
        }`;
}

function renderParagraph(paragraph: a.Paragraph, pluginConverter: PluginConverter): TemplateResult {
    return html`<p>${renderContent(paragraph.content, pluginConverter)}</p>`;
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

function renderTopic(topic: a.Topic, level: number, prefix: string | undefined, buildIndex: boolean, pluginConverter: PluginConverter): TemplateResult {
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
                    return renderTopic(value, level + 1, newPrefix, false, pluginConverter);
                } else {
                    return renderParagraph(value, pluginConverter);
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

export function renderArticle(article: a.Article, pluginConverter?: PluginConverter): TemplateResult {
    const pc = pluginConverter === undefined ? (plugin: {}): a.Content[] => { throw new Error('A plugin converter is not provided.'); } : pluginConverter;
    return html`<div class="article">${renderTopic(article.topic, 1, (article.numberBeforeTitle ? '' : undefined), article.index, pc)}<div>`;
}
