import * as assert from 'assert';
import { DocArticle, parseDocument } from '../src';

test(`Empty Document`, () => {
    const input = `
<document symbolId="::MyClass" accessor="" category="Class" name="MyClass">
</document>
`;
    const output: DocArticle = {
        symbolId: '::MyClass',
        category: 'Class',
        name: 'MyClass'
    };
    assert.deepStrictEqual(parseDocument(input), output);
});
