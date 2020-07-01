import * as path from 'path';
import { Element, xml2js } from 'xml-js';

export interface DocTreeNode {
    name: string;
    kind: 'root' | 'article' | 'namespace' | 'directory' | 'document';
    path: string[];
    file?: string;
    subNodes?: DocTreeNode[];
}

export function loadTree(target: DocTreeNode, entryPath: string, url: string[]): void {
    const wd = path.dirname(entryPath);
    const xml = <Element>xml2js(
        entryPath,
        {
            compact: false,
            ignoreDeclaration: true,
            ignoreInstruction: true,
            ignoreComment: true,
            ignoreDoctype: true
        }
    );
    if (xml.elements === undefined) {
        return;
    }

    const xmlNodes = xml.elements[0].elements;

    if (xmlNodes !== undefined) {
        for (const xmlNode of xmlNodes) {
            switch (xmlNode.name) {
                case 'article': {
                    const name = <string>xmlNode.attributes?.name;
                    const file = <string>xmlNode.attributes?.file;
                    const child: DocTreeNode = {
                        name,
                        kind: 'article',
                        path: url.concat(file.split('/')),
                        file: path.join(wd, `${file}.xml`)
                    };
                    if (target.subNodes === undefined) {
                        target.subNodes = [];
                    }
                    target.subNodes.push(child);
                    break;
                }
                case 'namespace': {
                    const name = <string>xmlNode.attributes?.name;
                    const child: DocTreeNode = {
                        name,
                        kind: 'namespace',
                        path: url.concat([name])
                    };
                    if (target.subNodes === undefined) {
                        target.subNodes = [];
                    }
                    target.subNodes.push(child);
                    break;
                }
                case 'document': {
                    const name = <string>xmlNode.attributes?.name;
                    const file = <string | undefined>xmlNode.attributes?.file;
                    const child: DocTreeNode = {
                        name,
                        kind: file === undefined ? 'directory' : 'document',
                        path: url.concat([name])
                    };
                    if (target.subNodes === undefined) {
                        target.subNodes = [];
                    }
                    target.subNodes.push(child);
                    break;
                }
                case 'link': {
                    const prefix = <string>xmlNode.attributes?.path;
                    const file = <string>xmlNode.attributes?.file;
                    loadTree(target, path.join(wd, file), url.concat(prefix.split('/')));
                    break;
                }
                default:
                    throw new Error(`Unrecognized reference node type ${xmlNode.name}`);
            }
        }
    }
}
