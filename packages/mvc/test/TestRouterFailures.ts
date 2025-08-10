import { expect, test } from 'vitest';
import { route } from '../src/index.js';

test(`Empty pattern`, () => {
    expect(() => {
        return route``;
    }).toThrow();
});

test(`Pattern not begin with "/"`, () => {
    expect(() => {
        return route``;
    }).toThrow();
});

test(`Multiple properties in one parameter`, () => {
    expect(() => {
        return route`a`;
    }).toThrow();

    expect(() => {
        return route`${{ a: '' }}`;
    }).toThrow();
});

test(`Empty pattern between "/"s`, () => {
    expect(() => {
        return route`/first//second`;
    }).toThrow();

    expect(() => {
        return route`/${{ a: '' }}//${{ b: '' }}`;
    }).toThrow();
});

test(`Empty pattern between parameters`, () => {
    expect(() => {
        return route`/${{ a: '' }}${{ b: '' }}`;
    }).toThrow();

    expect(() => {
        return route`/first${{ a: '' }}${{ b: '' }}second`;
    }).toThrow();
});

test(`Pattern array must be in the last pattern`, () => {
    expect(() => {
        return route`/${{ a: [''] }}/last`;
    }).toThrow();

    expect(() => {
        return route`/first${{ a: [''] }}/last`;
    }).toThrow();

    expect(() => {
        return route`/${{ a: [''] }}second/last`;
    }).toThrow();

    expect(() => {
        return route`/first${{ a: [''] }}second/last`;
    }).toThrow();

    expect(() => {
        return route`/first${{ a: '' }}second${{ b: [''] }}/last`;
    }).toThrow();
});
