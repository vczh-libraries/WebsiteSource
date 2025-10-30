import { DocTree, DocTreeNode } from './treeView.js';
import * as fs from 'fs';
import * as path from 'path';

function generateIndexForProject(nodes: DocTreeNode[], prefix: string, directory: string, relativeDirectory: string): string {
    let indexMd = "";
    for (const node of nodes.filter(node => node.kind === "article")) {
        const markdownRelativePath = node.path!.join('/') + '.md';
        indexMd += `${prefix}- [${node.name}](${relativeDirectory}${markdownRelativePath})\r\n`;
        if (node.subNodes) {
            indexMd += generateIndexForProject(node.subNodes, prefix + "  ", directory, relativeDirectory);
        }
    }
    return indexMd;
}

export function convertDocumentToMarkdown(docTree: DocTree, directory: string): void {
    if (fs.existsSync(directory)) {
        fs.rmSync(directory, { recursive: true, force: true });
    }
    fs.mkdirSync(directory, { recursive: true });

    const manualDir = path.join(directory, "manual");
    fs.mkdirSync(manualDir);

    let indexMd = "# Manual\r\n\r\n";
    for (const projectNode of docTree.root.subNodes!) {
        if (projectNode.name === "Gaclib Document") continue;
        const subNodes = (projectNode.subNodes || []).filter(node => node.kind === "article" && node.name !== "Breaking changes from 1.0" && node.name !== "References");
        if (subNodes.length === 0) continue;

        indexMd += `## ${projectNode.name}\r\n\r\n${generateIndexForProject(subNodes, "", manualDir, "./manual/")}\r\n`;
    }

    fs.writeFileSync(path.join(directory, "index.md"), indexMd, { encoding: 'utf-8' });
    fs.writeFileSync(path.join(directory, "docTree.md"), JSON.stringify(docTree, undefined, 2), { encoding: 'utf-8' });
}