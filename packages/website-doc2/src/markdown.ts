
import { Article, Content, parseArticle, Topic } from 'gaclib-article';
import { DocTree, DocTreeNode } from './treeView.js';
import * as fs from 'fs';
import * as path from 'path';
import { parseArticlePlugin } from './plugins/article/index.js';
import { ControlTemplatesPlugin, renderControlTemplates } from './plugins/article/xmlControlTemplates.js';
import { renderSample, SamplePlugin } from './plugins/article/xmlSample.js';

type CollectedNodes = { [path: string]: DocTreeNode };

function escapeText(text: string): string {
    return text.replaceAll("<", "\\<").replaceAll(">", "\\>");
}

function generateIndexForProject(nodes: DocTreeNode[], prefix: string, directory: string, relativeDirectory: string, collectedNodes: CollectedNodes): string {
    let indexMd = "";
    for (const node of nodes.filter(node => node.kind === "article")) {
        const markdownRelativePath = node.path!.join('/') + '.md';
        collectedNodes[path.join(directory, markdownRelativePath)] = node;

        indexMd += `${prefix}- [${escapeText(node.name)}](${relativeDirectory}${markdownRelativePath})\r\n`;
        if (node.subNodes) {
            indexMd += generateIndexForProject(node.subNodes, prefix + "  ", directory, relativeDirectory, collectedNodes);
        }
    }
    return indexMd;
}

function renderContentToText(contents: Content[]): string {
    let md = "";
    for (const content of contents) {
        switch (content.kind) {
            case "Text":
            case "Name":
                md += content.text;
                break;
            case "Strong":
                md += renderContentToText(content.content);
                break;
            case "Emphasise":
                md += renderContentToText(content.content);
                break;
            default:
                throw new Error(`renderContentToText(): ${content.kind} rendering is not supported yet.`);
        }
    }
    return md;
}

const missingArticleUrls: string[] = [];

function rewriteLink(href: string, collectedNodes: CollectedNodes, directory: string, relativeUrlPrefix: string): string | undefined {
    if (href.startsWith("http://")) {
        return href;
    } else if (href.startsWith("https://")) {
        return href;
    } else if (href.startsWith("//")) {
        throw new Error(`Unsupported url in markdown: ${href}`);
    } else if (href.startsWith("/")) {
        href = href.replaceAll(/\.html(#.*)?$/g, '');
        href = `./${href.substring(1)}.md`;
        if (collectedNodes[path.join(directory, href)]) {
            return relativeUrlPrefix + href;
        } else {
            missingArticleUrls.push(href);
            return undefined;
        }
    } else {
        throw new Error(`Unsupported url in markdown: ${href}`);
    }
}

function formatText(text: string): string {
    return text
        .split(/\r?\n/)
        .filter(line => line.trim().length > 0)
        .map(line => line.trim())
        .join(' ');
}

function renderContent(contents: Content[], listPrefix: string, collectedNodes: CollectedNodes, directory: string, relativeUrlPrefix: string): string {
    let md = "";
    for (const content of contents) {
        switch (content.kind) {
            case "Text":
                md += escapeText(content.text);
                break;
            case "PageLink": {
                const url = rewriteLink(content.href, collectedNodes, directory, relativeUrlPrefix);
                if (url) {
                    md += `[${renderContentToText(content.content)}](${url})`;
                } else {
                    md += `${renderContentToText(content.content)}\`missing document: ${content.href}\``;
                }
                break;
            }
            case "Name":
                md += `\`${content.text}\``;
                break;
            case "Image":
                md += `![](https://gaclib.net/doc${content.src})`;
                break;
            case "List": {
                for (const item of content.items) {
                    switch (item.kind) {
                        case "ContentListItem": {
                            md += `\r\n${listPrefix}- ` + renderContent(item.content, listPrefix + "  ", collectedNodes, directory, relativeUrlPrefix);
                            break;
                        }
                        case "ParagraphListItem": {
                            md += `\r\n${listPrefix}- \`empty list item\``;
                            for (const p of item.paragraphs) {
                                md += `\r\n${listPrefix}  ` + formatText(renderContent(p.content, listPrefix + "    ", collectedNodes, directory, relativeUrlPrefix));
                            }
                            break;
                        }
                    }
                }
                break;
            }
            case "Strong":
                md += "**" + renderContent(content.content, listPrefix, collectedNodes, directory, relativeUrlPrefix) + "**";
                break;
            case "Emphasise":
                md += "_" + renderContent(content.content, listPrefix, collectedNodes, directory, relativeUrlPrefix) + "_";
                break;
            case "Program":
                md += `\r\n\`\`\`${content.language || ''}\r\n${content.code}\r\n\`\`\`\r\n`;
                break;
            case "Plugin": {
                const sp = (<ControlTemplatesPlugin | SamplePlugin>content.plugin);
                const kind = sp.kind;
                switch (sp.kind) {
                    case "SamplePlugin": {
                        md += renderContent(renderSample(sp), listPrefix, collectedNodes, directory, relativeUrlPrefix);
                        break;
                    }
                    case "ControlTemplatesPlugin": {
                        md += renderContent(renderControlTemplates(sp), listPrefix, collectedNodes, directory, relativeUrlPrefix);
                        break;
                    }
                    default: {
                        throw new Error(`Unrecognized plugin kind: ${kind}.`);
                    }
                }
                break;
            }
            default:
                throw new Error(`renderContent(): ${content.kind} rendering is not supported yet.`);
        }
    }
    return md;
}

function generateMarkdownFromTopic(topic: Topic, topicPrefix: string, collectedNodes: CollectedNodes, directory: string, relativeUrlPrefix: string): string {
    let md = `${topicPrefix} ${escapeText(topic.title)}\r\n\r\n`;
    for (const content of topic.content) {
        switch (content.kind) {
            case 'Paragraph':
                md += formatText(renderContent(content.content, "", collectedNodes, directory, relativeUrlPrefix)) + `\r\n\r\n`;
                break;
            case 'Topic':
                md += generateMarkdownFromTopic(content, `${topicPrefix}#`, collectedNodes, directory, relativeUrlPrefix);
                break;
        }
    }
    return md;
}

function generateMarkdownFromArticle(article: Article, collectedNodes: CollectedNodes, directory: string, relativeUrlPrefix: string): string {
    return generateMarkdownFromTopic(article.topic, "#", collectedNodes, directory, relativeUrlPrefix);
}

function generateMarkdown(outputPath: string, node: DocTreeNode, collectedNodes: CollectedNodes, directory: string): void {
    const articleXml = fs.readFileSync(node.file!, { encoding: 'utf-8' });
    const article = parseArticle(articleXml, parseArticlePlugin);
    const articleMd = generateMarkdownFromArticle(article, collectedNodes, directory, (node.path!.length > 1 ? "../".repeat(node.path!.length - 1) : "./"));
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, articleMd, { encoding: 'utf-8' });
}

export function convertDocumentToMarkdown(docTree: DocTree, directory: string): void {
    if (fs.existsSync(directory)) {
        fs.rmSync(directory, { recursive: true, force: true });
    }
    fs.mkdirSync(directory, { recursive: true });

    const manualDir = path.join(directory, "manual");
    fs.mkdirSync(manualDir);

    const collectedNodes: CollectedNodes = {};
    const excludedFirstLevelNames = ["Breaking changes from 1.0", "References", "Build your first GacUI Application!"];
    let indexMd = "# Copy of Online Manual\r\n\r\n";
    for (const projectNode of docTree.root.subNodes!) {
        if (projectNode.name === "Gaclib Document") continue;
        const subNodes = (projectNode.subNodes || []).filter(node => node.kind === "article" && !excludedFirstLevelNames.includes(node.name));
        if (subNodes.length === 0) continue;

        indexMd += `## ${projectNode.name}\r\n\r\n${generateIndexForProject(subNodes, "", manualDir, "./manual/", collectedNodes)}\r\n`;
    }

    const failedPaths: [string, Error][] = [];
    for (const path in collectedNodes) {
        try {
            const node = collectedNodes[path];
            generateMarkdown(path, node, collectedNodes, manualDir);
            console.log(`Generating ${node.file!} -> ${path}`);
        } catch (error) {
            failedPaths.push([path, error as Error]);
        }
    }

    fs.writeFileSync(path.join(directory, "index.md"), indexMd, { encoding: 'utf-8' });
    fs.writeFileSync(path.join(directory, "docTree.md"), JSON.stringify(docTree, undefined, 2), { encoding: 'utf-8' });

    if (failedPaths.length > 0) {
        console.error(`\r\nFailed to generate:`);
        for (const [path, error] of failedPaths) {
            console.error(`${path}: ${error.message}`);
        }
    }

    if (missingArticleUrls.length > 0) {
        console.error(`\r\nMissing article urls:`);
        for (const url of missingArticleUrls) {
            if (url.includes("/ctemplates/") || url.includes("/ref/")) continue;
            console.error(`${url}`);
        }
    }
}