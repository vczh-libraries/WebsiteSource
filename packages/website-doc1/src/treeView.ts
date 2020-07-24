import { readFileSync } from 'fs';
import * as path from 'path';
import { Element, xml2js } from 'xml-js';
import { DirectoryInfo, DirectoryNode } from './views';

export interface DocTreeNode {
    name: string;
    kind: 'root' | 'article' | 'namespace' | 'directory' | 'document';
    docId?: string;
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
    ids: { [key: string]: DocTreeNode };
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
                path: url.concat([name.replace(/:/g, '_')])
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
            const docId = <string | undefined>xmlNode.attributes?.docId;
            if (file === undefined) {
                child = {
                    name,
                    kind: 'directory'
                };
            } else {
                child = {
                    name,
                    kind: 'document',
                    docId: `${docId}`,
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
            const pathPrefix = <string>xmlNode.attributes?.pathPrefix;
            const filePrefix = <string>xmlNode.attributes?.filePrefix;
            const file = <string>xmlNode.attributes?.file;
            loadDocTreeNode(target, path.join(wd, file), filePrefix, url.concat(pathPrefix.split('/')));
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

function loadDocTreeNode(target: DocTreeNode, entryPath: string, filePrefix: string, url: string[]): void {
    let wd = path.dirname(entryPath);
    if (filePrefix !== '') {
        wd = path.join(wd, filePrefix);
    }
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

function fillIds(ids: { [key: string]: DocTreeNode }, node: DocTreeNode): void {
    if (node.docId !== undefined) {
        if (ids[node.docId] === undefined) {
            ids[node.docId] = node;
        } else {
            console.error(`ERROR: Duplicated reference symbol id found: ${node.docId}`);
        }
    }
    if (node.subNodes !== undefined) {
        for (const subNode of node.subNodes) {
            fillIds(ids, subNode);
        }
    }
}

function stepIndex(index: DocTreeIndex, item: string, createIfNotExists: false): DocTreeIndex | undefined;
function stepIndex(index: DocTreeIndex, item: string, createIfNotExists: true): DocTreeIndex;
function stepIndex(index: DocTreeIndex, item: string, createIfNotExists: boolean): DocTreeIndex | undefined {
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

export function stepIndexByPath(index: DocTreeIndex, url: string[]): DocTreeIndex | undefined {
    let current = index;
    for (const item of url) {
        const next = stepIndex(current, item, false);
        if (next === undefined) {
            return undefined;
        }
        current = next;
    }
    return current;
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
        ids: {},
        index: {}
    };
    loadDocTreeNode(result.root, entryPath, '', []);
    fillParents(result.parents, result.root);
    fillIds(result.ids, result.root);
    fillIndex(result.index, result.root);
    return result;
}

function getDirectoryNode(node: DocTreeNode, selected: boolean): DirectoryNode {
    const dnode: DirectoryNode = {
        name: node.name,
        selected
    };
    if (node.path !== undefined) {
        dnode.path = node.path;
    }
    return dnode;
}

function getDirectoryNodeFromCurrent(current: DocTreeNode, node: DocTreeNode): DirectoryNode {
    const dnode = getDirectoryNode(node, node === current);
    if (node === current || node.kind === 'directory') {
        if (node.subNodes !== undefined) {
            dnode.subNodes = node.subNodes.map((subNode: DocTreeNode) => getDirectoryNodeFromCurrent(current, subNode));
        }
    }
    return dnode;
}

function getDirectoryNodeSibilings(current: DocTreeNode, parent: DocTreeNode, dnode: DirectoryNode): DirectoryNode[] {
    if (parent.subNodes === undefined) {
        return [];
    } else {
        return parent.subNodes.map((subNode: DocTreeNode) => subNode === current ? dnode : getDirectoryNodeFromCurrent(current, subNode));
    }
}

export function getDirectoryInfoFromPath(docTree: DocTree, url: string[], index: DocTreeIndex | undefined): DirectoryInfo | undefined {
    if (index === undefined) {
        console.error(`ERROR: Reference page path does not exist: ${url.join('/')}`);
        return undefined;
    }
    if (index.node === undefined) {
        console.error(`ERROR: Reference page path is not complete: ${url.join('/')}`);
        return undefined;
    }

    const dnode = getDirectoryNodeFromCurrent(index.node, index.node);
    const parentNode = docTree.parents.get(index.node);
    if (parentNode === undefined) {
        return {
            subNodes: [dnode]
        };
    } else {
        let dsiblings = getDirectoryNodeSibilings(index.node, parentNode, dnode);
        if (parentNode.kind !== 'root') {
            let current: DocTreeNode | undefined = parentNode;
            while (current !== undefined) {
                const dcurrent = getDirectoryNode(current, false);
                dcurrent.subNodes = dsiblings;
                dsiblings = [dcurrent];

                current = docTree.parents.get(current);
                if (current?.kind === 'root') {
                    current = undefined;
                }
            }
        }
        return {
            subNodes: dsiblings
        };
    }
}
