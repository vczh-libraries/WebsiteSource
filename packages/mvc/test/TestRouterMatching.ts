/* eslint-disable @typescript-eslint/no-unused-vars */

import * as assert from 'assert';
import { createRouter, HttpMethods, route } from '../src/index.js';

test(`Query not begin with "/"`, () => {
    expect(() => {
        createRouter<{}>().match('GET', '');
    }).toThrow();
});

function returnMethod(method: HttpMethods, model: {}): HttpMethods {
    return method;
}

test(`Query mismatched`, () => {
    const router = createRouter<{}>();
    router.register(['GET'], route`/index.html`, returnMethod);

    assert.deepStrictEqual(router.match('GET', '/'), undefined);
});

test(`Query ambiguous`, () => {
    const router = createRouter<{}>();
    router.register(['GET'], route`/index.html`, returnMethod);
    router.register(['GET'], route`/index.html`, returnMethod);

    expect(() => {
        router.match('GET', '/index.html');
    }).toThrow();
});

test(`Query match methods`, () => {
    const router = createRouter<HttpMethods>();
    router.register(['GET'], route`/`, returnMethod);
    router.register(['POST', 'PUT'], route`/`, returnMethod);
    router.register(['DELETE'], route`/`, returnMethod);

    assert.deepStrictEqual(router.match('GET', '/'), 'GET');
    assert.deepStrictEqual(router.match('POST', '/'), 'POST');
    assert.deepStrictEqual(router.match('PUT', '/'), 'PUT');
    assert.deepStrictEqual(router.match('DELETE', '/'), 'DELETE');
    assert.deepStrictEqual(router.match('PATCH', '/'), undefined);
});

test(`Query match parameters`, () => {
    const router = createRouter<{}>();
    router.register([], route`/`, (method: HttpMethods, model: {}) => 'root');
    router.register([], route`/index.html`, (method: HttpMethods, model: {}) => 'index');
    router.register([], route`/getting_started/${{ lib: '' }}.html`, (method: HttpMethods, model: {}) => model);
    router.register([], route`/tutorial/${{ tutorial: '' }}/demo/${{ title: '' }}.html`, (method: HttpMethods, model: {}) => model);
    router.register([], route`/document/1.0-${{ path: [''] }}.html`, (method: HttpMethods, model: {}) => model);

    assert.deepStrictEqual(router.match('GET', '/'), 'root');
    assert.deepStrictEqual(router.match('GET', '/index.html'), 'index');
    assert.deepStrictEqual(router.match('GET', '/getting_started/vlpp.html'), { lib: 'vlpp' });
    assert.deepStrictEqual(router.match('GET', '/tutorial/HelloWorld/demo/CppXml.html'), { tutorial: 'HelloWorld', title: 'CppXml' });
    assert.deepStrictEqual(router.match('GET', '/document/1.0-home.html'), { path: ['home'] });
    assert.deepStrictEqual(router.match('GET', '/document/1.0-gacui/controls/introduction.html'), { path: ['gacui', 'controls', 'introduction'] });
});

test(`Query match parameters with prefix`, () => {
    const router = createRouter<{}>(`/prefix`);
    router.register([], route`/index.html`, (method: HttpMethods, model: {}) => 'index');
    router.register([], route`/getting_started/${{ lib: '' }}.html`, (method: HttpMethods, model: {}) => model);
    router.register([], route`/tutorial/${{ tutorial: '' }}/demo/${{ title: '' }}.html`, (method: HttpMethods, model: {}) => model);
    router.register([], route`/document/1.0-${{ path: [''] }}.html`, (method: HttpMethods, model: {}) => model);

    assert.deepStrictEqual(router.match('GET', '/prefix/index.html'), 'index');
    assert.deepStrictEqual(router.match('GET', '/prefix/getting_started/vlpp.html'), { lib: 'vlpp' });
    assert.deepStrictEqual(router.match('GET', '/prefix/tutorial/HelloWorld/demo/CppXml.html'), { tutorial: 'HelloWorld', title: 'CppXml' });
    assert.deepStrictEqual(router.match('GET', '/prefix/document/1.0-home.html'), { path: ['home'] });
    assert.deepStrictEqual(router.match('GET', '/prefix/document/1.0-gacui/controls/introduction.html'), { path: ['gacui', 'controls', 'introduction'] });
});
