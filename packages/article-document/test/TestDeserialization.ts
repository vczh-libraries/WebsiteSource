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
