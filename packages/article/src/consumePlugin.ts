import * as a from './interfaces';

type PluginConverter = (plugin: {}) => a.Content[];

function processContents(contents: a.Content[], pluginConverter: PluginConverter): void {
    for (let i = contents.length - 1; i >= 0; i--) {
        const c = contents[i];
        switch (c.kind) {
            case 'Plugin': {
                const cs = pluginConverter(c.plugin);
                contents.splice(i, 1);
                for (let j = 0; j < cs.length; j++) {
                    contents.splice(i + j, 0, cs[j]);
                }
                break;
            }
            case 'List': {
                for (const item of c.items) {
                    switch (item.kind) {
                        case 'ContentListItem':
                            processContents(item.content, pluginConverter);
                            break;
                        case 'ParagraphListItem':
                            for (const p of item.paragraphs) {
                                processContents(p.content, pluginConverter);
                            }
                            break;
                        default:
                    }
                }
                break;
            }
            case 'Strong':
            case 'Emphasise': {
                processContents(c.content, pluginConverter);
                break;
            }
            default:
        }
    }
}

function processTopic(topic: a.Topic, pluginConverter: PluginConverter): void {
    for (const content of topic.content) {
        switch (content.kind) {
            case 'Topic':
                processTopic(content, pluginConverter);
                break;
            case 'Paragraph':
                processContents(content.content, pluginConverter);
                break;
            default:
        }
    }
}

export function consumePlugin(article: a.Article, pluginConverter: PluginConverter): void {
    processTopic(article.topic, pluginConverter);
}
