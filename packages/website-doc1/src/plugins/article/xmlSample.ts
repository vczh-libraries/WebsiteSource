import * as a from 'gaclib-article';
import { Element } from 'xml-js';

interface SamplePlugin {
    name: string;
    urlImage: string;
    urlXml: string;
}

export function parseSample(e: Element): a.Plugin | undefined {
    if (e.type === 'element' && e.name === 'sample') {
        /*
         * <sample name="layout_bounds"/>
         * <sample name="kb_xmlres_data" file="TextPage.xml" image="kb_xmlres_tag_text.gif"/>
         * <sample url="https://github.com/vczh-libraries/Release/blob/master/Tutorial/GacUI_Layout/Responsive2/UI/Resource.xml" image="kb_compositions_responsive_2.gif"/>
         */
        const attr: {
            name?: string;
            file?: string;
            image?: string;
            url?: string;
        } = {};
        if (e.attributes === undefined) {
            throw new Error(`Missing attribute "name", "file", "image" or "url" in <sample>`);
        } else {
            for (const key of Object.keys(e.attributes)) {
                switch (key) {
                    case 'name':
                    case 'file':
                    case 'image':
                    case 'url': {
                        const value = e.attributes[key];
                        if (typeof value === 'string') {
                            attr[key] = value;
                        } else {
                            throw new Error(`Attribute ${key} in <sample> should be a string.`);
                        }
                        break;
                    }
                    default:
                        throw new Error(`Unrecognized attribute ${key} in <article>.`);
                }
            }
        }

        let plugin: SamplePlugin | undefined;
        if (attr.name !== undefined && attr.file === undefined && attr.image === undefined && attr.url === undefined) {
            plugin = {
                name: attr.name,
                urlImage: `/gacui/${attr.name}.gif`,
                urlXml: `https://github.com/vczh-libraries/Release/blob/master/SampleForDoc/GacUI/XmlRes/${attr.name}/Resource.xml`
            };
        }
        if (attr.name !== undefined && attr.file === undefined && attr.image !== undefined && attr.url === undefined) {
            plugin = {
                name: attr.name,
                urlImage: `/gacui/${attr.image}`,
                urlXml: `https://github.com/vczh-libraries/Release/blob/master/SampleForDoc/GacUI/XmlRes/${attr.name}/Resource.xml`
            };
        }
        if (attr.name !== undefined && attr.file !== undefined && attr.image !== undefined && attr.url === undefined) {
            plugin = {
                name: attr.name,
                urlImage: `/gacui/${attr.image}`,
                urlXml: `https://github.com/vczh-libraries/Release/blob/master/SampleForDoc/GacUI/XmlRes/${attr.name}/${attr.file}.xml`
            };
        }
        if (attr.name === undefined && attr.file === undefined && attr.image !== undefined && attr.url !== undefined) {
            let name = attr.url;
            const prefix = 'https://github.com/vczh-libraries/Release/blob/master/';
            if (name.startsWith(prefix)) {
                name = name.substr(prefix.length);
            }
            plugin = {
                name,
                urlImage: `/gacui/${attr.image}`,
                urlXml: attr.url
            };
        }

        if (plugin === undefined) {
            throw new Error(`Attributes in <sample> must be "name", "name;image", "name;file;image" or "url;image"`);
        } else {
            return {
                kind: 'Plugin',
                plugin
            };
        }
    } else {
        return undefined;
    }
}

export function renderSample(plugin: {}): a.Content[] {
    const sp = (<SamplePlugin>plugin);
    return [{
        kind: 'List',
        ordered: false,
        items: [{
            kind: 'ContentListItem',
            content: [{
                kind: 'Text',
                text: 'Source code: '
            }, {
                kind: 'PageLink',
                href: sp.urlXml,
                content: [{
                    kind: 'Text',
                    text: sp.name
                }]
            }]
        }, {
            kind: 'ContentListItem',
            content: [{
                kind: 'Image',
                src: sp.urlImage
            }]
        }]
    }];
}
