import { readFileSync } from 'fs';
import * as path from 'path';
import { Element, xml2js } from 'xml-js';

export interface DocTreeNode {
    name: string;
    kind: 'root' | 'article' | 'namespace' | 'directory' | 'document';
    path?: string[];
    file?: string;
    subNodes?: DocTreeNode[];
}

export interface DocTreeIndex {
    node?: DocTreeNode;
    subNodes?: { [key: string]: DocTreeIndex };
}

export interface DocTree {
    root: DocTreeNode;
    parents: Map<DocTreeNode, DocTreeNode>;
    index: DocTreeIndex;
}

function loadDocTreeNodeFromElement(target: DocTreeNode, xmlNode: Element, wd: string, url: string[]): void {
    let child: DocTreeNode | undefined;
    switch (xmlNode.name) {
        case 'article': {
            const name = <string>xmlNode.attributes?.name;
            const file = <string>xmlNode.attributes?.file;
            child = {
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
            child = {
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
            if (file === undefined) {
                child = {
                    name,
                    kind: 'directory'
                };
            } else {
                child = {
                    name,
                    kind: 'document',
                    path: url.concat([file]),
                    file: path.join(wd, `${file}.xml`)
                };
            }
            if (target.subNodes === undefined) {
                target.subNodes = [];
            }
            target.subNodes.push(child);
            break;
        }
        case 'link': {
            const prefix = <string>xmlNode.attributes?.path;
            const file = <string>xmlNode.attributes?.file;
            loadDocTreeNode(target, path.join(wd, file), url.concat(prefix.split('/')));
            break;
        }
        default:
            throw new Error(`Unrecognized reference node type ${xmlNode.name}`);
    }

    if (child !== undefined && xmlNode.elements !== undefined) {
        for (const subNode of xmlNode.elements) {
            loadDocTreeNodeFromElement(child, subNode, wd, url);
        }
    }
}

function loadDocTreeNode(target: DocTreeNode, entryPath: string, url: string[]): void {
    const wd = path.dirname(entryPath);
    const xml = <Element>xml2js(
        readFileSync(entryPath, { encoding: 'utf-8' }),
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
            loadDocTreeNodeFromElement(target, xmlNode, wd, url);
        }
    }
}

function fillParents(parents: Map<DocTreeNode, DocTreeNode>, node: DocTreeNode): void {
    if (node.subNodes !== undefined) {
        for (const subNode of node.subNodes) {
            parents.set(subNode, node);
            fillParents(parents, subNode);
        }
    }
}

export function stepIndex(index: DocTreeIndex, item: string, createIfNotExists: false): DocTreeIndex | undefined;
export function stepIndex(index: DocTreeIndex, item: string, createIfNotExists: true): DocTreeIndex;
export function stepIndex(index: DocTreeIndex, item: string, createIfNotExists: boolean): DocTreeIndex | undefined {
    if (index.subNodes === undefined) {
        if (!createIfNotExists) {
            return undefined;
        }
        index.subNodes = {};
    }

    let next = index.subNodes[item];
    if (next === undefined) {
        if (!createIfNotExists) {
            return undefined;
        }
        next = {};
        index.subNodes[item] = next;
    }

    return next;
}

function fillIndex(index: DocTreeIndex, node: DocTreeNode): void {
    if (node.path !== undefined) {
        let current = index;
        for (const item of node.path) {
            current = stepIndex(current, item, true);
        }

        if (current.node === undefined) {
            current.node = node;
        } else {
            console.error(`ERROR: Duplicated reference page path found: ${node.path.join('/')}`);
        }
    }
    if (node.subNodes !== undefined) {
        for (const subNode of node.subNodes) {
            fillIndex(index, subNode);
        }
    }
}

export function loadDocTree(entryPath: string): DocTree {
    const result: DocTree = {
        root: {
            name: '',
            kind: 'root'
        },
        parents: new Map<DocTreeNode, DocTreeNode>(),
        index: {}
    };
    loadDocTreeNode(result.root, entryPath, []);
    fillParents(result.parents, result.root);
    fillIndex(result.index, result.root);
    return result;
}
