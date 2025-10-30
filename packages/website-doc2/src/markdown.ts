import { DocTree } from './treeView.js';
import * as fs from 'fs';
import * as path from 'path';

export function convertDocumentToMarkdown(docTree: DocTree, directory: string): void {
    if (fs.existsSync(directory)) {
        fs.rmSync(directory, { recursive: true, force: true });
    }
    fs.mkdirSync(directory, { recursive: true });
    fs.mkdirSync(path.join(directory, "manual"));

    let indexMd = "# Manual\r\n\r\n";
    for (const projectNode of docTree.root.subNodes!) {
        if (projectNode.name === "Gaclib Document") continue;
        const subNodes = (projectNode.subNodes || []).filter(node => node.name !== "Breaking changes from 1.0" && node.name !== "References");
        if (subNodes.length === 0) continue;

        indexMd += `## ${projectNode.name}\r\n\r\n`;
    }

    fs.writeFileSync(path.join(directory, "index.md"), indexMd, { encoding: 'utf-8' });
    fs.writeFileSync(path.join(directory, "docTree.md"), JSON.stringify(docTree, undefined, 2), { encoding: 'utf-8' });
}