import { readFileSync } from 'fs';
import * as path from 'path';
import { Element, xml2js } from 'xml-js';
import { RegisteredTypesInfo } from './views/registeredTypesView';

const reflectionXml = <Element>xml2js(
    readFileSync(path.join(__dirname, '../../../../Document/Tools/Demos/Gaclib/Reflection.xml'), { encoding: 'utf-8' }),
    {
        compact: false,
        ignoreDeclaration: true,
        ignoreInstruction: true,
        ignoreComment: true,
        ignoreDoctype: true
    }
);

export function getRegisteredTypes(project: string): RegisteredTypesInfo {
    if (reflectionXml.elements !== undefined) {
        const xmlReflection = reflectionXml.elements[0];
        if (xmlReflection.elements !== undefined) {
            for (const xmlProject of xmlReflection.elements) {
                if (xmlProject.type === 'element' && xmlProject.attributes !== undefined && xmlProject.attributes.name === project) {
                    const info: RegisteredTypesInfo = {
                        types: []
                    };

                    if (xmlProject.elements !== undefined) {
                        for (const xmlType of xmlProject.elements) {
                            if (xmlType.type === 'element' && xmlType.attributes !== undefined) {
                                info.types.push({
                                    kind: <string>xmlType.name,
                                    name: <string>xmlType.attributes.name,
                                    cpp: <string>xmlType.attributes.cpp
                                });
                            }
                        }
                    }

                    return info;
                }
            }
        }
    }

    throw new Error(`Unknown project for registered types: ${project}.`);
}
