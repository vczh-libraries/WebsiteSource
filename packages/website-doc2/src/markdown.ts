
import { Article, Content, parseArticle, Topic } from 'gaclib-article';
import { DocTree, DocTreeNode } from './treeView.js';
import * as fs from 'fs';
import * as path from 'path';
import { parseArticlePlugin } from './plugins/article/index.js';
import { ControlTemplatesPlugin, renderControlTemplates } from './plugins/article/xmlControlTemplates.js';
import { renderSample, SamplePlugin } from './plugins/article/xmlSample.js';

type CollectedNodes = { [path: string]: DocTreeNode };

function generateIndexForProject(nodes: DocTreeNode[], prefix: string, directory: string, relativeDirectory: string, collectedNodes: CollectedNodes): string {
    let indexMd = "";
    for (const node of nodes.filter(node => node.kind === "article")) {
        const markdownRelativePath = node.path!.join('/') + '.md';
        collectedNodes[path.join(directory, markdownRelativePath)] = node;

        indexMd += `${prefix}- [${node.name}](${relativeDirectory}${markdownRelativePath})\r\n`;
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

function rewriteLink(href: string, collectedNodes: CollectedNodes, directory: string, relativeUrlPrefix: string): string | undefined {
    if (href.startsWith("http://")) {
        return href;
    } else if (href.startsWith("https://")) {
        return href;
    } else if (href.startsWith("//")) {
        throw new Error(`Unsupported url in markdown: ${href}`);
    } else {
        if (href.endsWith(".html")) {
            href = href.slice(0, -5);
        }
        if (collectedNodes[path.join(directory, href) + ".md"]) {
            return relativeUrlPrefix + href;
        } else {
            return undefined;
        }
    }
}

function renderContent(contents: Content[], collectedNodes: CollectedNodes, directory: string, relativeUrlPrefix: string): string {
    let md = "";
    for (const content of contents) {
        switch (content.kind) {
            case "Text":
                md += content.text;
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
            case "List":
                break;
            case "Strong":
                md += "**" + renderContent(content.content, collectedNodes, directory, relativeUrlPrefix) + "**";
                break;
            case "Emphasise":
                md += "_" + renderContent(content.content, collectedNodes, directory, relativeUrlPrefix) + "_";
                break;
            case "Program":
                md += `\r\n\`\`\`${content.language || ''}\r\n${content.code}\r\n\`\`\`\r\n`;
                break;
            case "Plugin": {
                const sp = (<ControlTemplatesPlugin | SamplePlugin>content.plugin);
                const kind = sp.kind;
                switch (sp.kind) {
                    case "SamplePlugin": {
                        md += renderContent(renderSample(sp), collectedNodes, directory, relativeUrlPrefix);
                        break;
                    }
                    case "ControlTemplatesPlugin": {
                        md += renderContent(renderControlTemplates(sp), collectedNodes, directory, relativeUrlPrefix);
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
    let md = `${topicPrefix} ${topic.title}\r\n\r\n`;
    for (const content of topic.content) {
        switch (content.kind) {
            case 'Paragraph':
                md += renderContent(content.content, collectedNodes, directory, relativeUrlPrefix) + `\r\n\r\n`;
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
    console.log(`Generating ${node.file!} -> ${outputPath}`);
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
    let indexMd = "# Manual\r\n\r\n";
    for (const projectNode of docTree.root.subNodes!) {
        if (projectNode.name === "Gaclib Document") continue;
        const subNodes = (projectNode.subNodes || []).filter(node => node.kind === "article" && !excludedFirstLevelNames.includes(node.name));
        if (subNodes.length === 0) continue;

        indexMd += `## ${projectNode.name}\r\n\r\n${generateIndexForProject(subNodes, "", manualDir, "./manual/", collectedNodes)}\r\n`;
    }

    const failedPaths: [string, Error][] = [];
    for (const path in collectedNodes) {
        try {
            generateMarkdown(path, collectedNodes[path], collectedNodes, directory);
        } catch (error) {
            failedPaths.push([path, error as Error]);
        }
    }

    fs.writeFileSync(path.join(directory, "index.md"), indexMd, { encoding: 'utf-8' });
    fs.writeFileSync(path.join(directory, "docTree.md"), JSON.stringify(docTree, undefined, 2), { encoding: 'utf-8' });

    for (const [path, error] of failedPaths) {
        console.error(`Failed to generate markdown for ${path}: ${error.message}`);
    }
}