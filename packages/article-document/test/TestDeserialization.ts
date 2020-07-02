import * as assert from 'assert';
import { DocArticle, parseDocument } from '../src';

test(`Empty Document`, () => {
    const input = `
<document symbolId="::MyClass" accessor="" category="Class" name="MyClass">
</document>
`;
    const output: DocArticle = {
        symbolId: '::MyClass',
        accessor: '',
        category: 'Class',
        name: 'MyClass'
    };
    assert.deepStrictEqual(parseDocument(input), output);
});

test(`<signature> and <example>`, () => {
    const input = `
<document symbolId="::MyClass" accessor="" category="Class" name="MyClass">
  <signature><![CDATA[this is a signature]]></signature>
  <example><![CDATA[this is an example]]></example>
</document>
`;
    const output: DocArticle = {
        symbolId: '::MyClass',
        accessor: '',
        category: 'Class',
        name: 'MyClass',
        signature: 'this is a signature',
        example: 'this is an example'
    };
    assert.deepStrictEqual(parseDocument(input), output);
});

test(`<basetypes> and <seealsos>`, () => {
    const input = `
<document symbolId="::MyClass" accessor="" category="Class" name="MyClass">
  <basetypes>
    <symbol docId="A" declFile="B" declId="C"/>
    <symbol docId="D" declFile="E" declId="F"/>
  </basetypes>
  <seealsos>
    <symbol declFile="B" declId="C"/>
    <symbol declFile="E" declId="F"/>
  </seealsos>
</document>
`;
    const output: DocArticle = {
        symbolId: '::MyClass',
        accessor: '',
        category: 'Class',
        name: 'MyClass',
        basetypes: [
            { docId: 'A', declFile: 'B', declId: 'C' },
            { docId: 'D', declFile: 'E', declId: 'F' }
        ],
        seealsos: [
            { declFile: 'B', declId: 'C' },
            { declFile: 'E', declId: 'F' }
        ]
    };
    assert.deepStrictEqual(parseDocument(input), output);
});
