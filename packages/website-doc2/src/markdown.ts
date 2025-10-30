
import { Article, parseArticle, Topic } from 'gaclib-article';
import { DocTree, DocTreeNode } from './treeView.js';
import * as fs from 'fs';
import * as path from 'path';
import { parseArticlePlugin } from './plugins/article/index.js';

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

function generateMarkdownFromTopic(topic: Topic, topicPrefix: string, collectedNodes: CollectedNodes): string {
    let md = `${topicPrefix} ${topic.title}\r\n\r\n`;
    for (const content of topic.content) {
        switch (content.kind) {
            case 'Paragraph':
                break;
            case 'Topic':
                md += generateMarkdownFromTopic(content, `${topicPrefix}#`, collectedNodes);
                break;
        }
    }
    return md;
}

function generateMarkdownFromArticle(article: Article, collectedNodes: CollectedNodes): string {
    return generateMarkdownFromTopic(article.topic, "#", collectedNodes);
}

function generateMarkdown(outputPath: string, node: DocTreeNode, collectedNodes: CollectedNodes): void {
    console.log(`Generating ${node.file!} -> ${outputPath}`);
    const articleXml = fs.readFileSync(node.file!, { encoding: 'utf-8' });
    const article = parseArticle(articleXml, parseArticlePlugin);
    const articleMd = generateMarkdownFromArticle(article, collectedNodes);
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

    for (const path in collectedNodes) {
        generateMarkdown(path, collectedNodes[path], collectedNodes);
    }

    fs.writeFileSync(path.join(directory, "index.md"), indexMd, { encoding: 'utf-8' });
    fs.writeFileSync(path.join(directory, "docTree.md"), JSON.stringify(docTree, undefined, 2), { encoding: 'utf-8' });
}