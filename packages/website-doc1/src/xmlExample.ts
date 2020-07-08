import { readFileSync } from 'fs';
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
    const code = <string>((codeXml.elements ?? [])[0].elements ?? [])[0].cdata;
    const output = readFileSync(`${fileName}.eout.${index}.txt`, { encoding: 'utf-8' });

    return {
        code: mergeCodeWithTemplate(category, code),
        output
    };
}
