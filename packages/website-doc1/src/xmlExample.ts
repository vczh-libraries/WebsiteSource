import { readFileSync } from 'fs';
import { trimEmptyLines } from 'gaclib-article';
import { DocExample } from 'gaclib-article-document';
import * as path from 'path';
import { Element, xml2js } from 'xml-js';

const templateCodeMapping: { [key: string]: string } = {
    VLPP: path.join(__dirname, '../../../../Document/Tools/Examples/Vlpp/Main.cpp')
};

const templateCodeContent: { [key: string]: string } = {};

function mergeCodeWithTemplate(category: string, code: string): string {
    let templateCode = templateCodeContent[category];
    if (templateCode === undefined) {
        templateCode = readFileSync(templateCodeMapping[category], { encoding: 'utf-8' });
        templateCodeContent[category] = templateCode;
    }

    return templateCode.replace(`#include "Example.h"`, code);
}

export function exampleRetriver(documentFile: string, index: number): DocExample {
    const fragments = documentFile.split('\\');
    const category = fragments[fragments.length - 2];
    const fileName = documentFile.slice(0, -4);

    const codeXml = <Element>xml2js(
        readFileSync(`${fileName}.ein.${index}.xml`, { encoding: 'utf-8' }),
        {
            compact: false,
            ignoreDeclaration: true,
            ignoreInstruction: true,
            ignoreComment: true,
            ignoreDoctype: true
        }
    );
    let code = trimEmptyLines((codeXml.elements ?? [])[0]);

    let codeLines = code.split('\n');
    let indent = -1;
    for (const line of codeLines) {
        if (line.trim() !== '') {
            const lineIndent = line.length - line.trimLeft().length;
            if (indent === -1 || indent > lineIndent) {
                indent = lineIndent;
            }
        }
    }
    if (indent !== -1) {
        codeLines = codeLines.map((line: string) => line.substr(indent));
    }
    code = codeLines.join('\n');

    let outputExists = true;
    if (codeXml.attributes !== undefined) {
        if (`${codeXml.attributes.output}` === 'false') {
            outputExists = false;
        }
    }

    if (outputExists) {
        const output = readFileSync(`${fileName}.eout.${index}.txt`, { encoding: 'utf-8' });
        return {
            code: mergeCodeWithTemplate(category, code),
            output
        };
    } else {
        return {
            code: mergeCodeWithTemplate(category, code)
        };
    }
}
