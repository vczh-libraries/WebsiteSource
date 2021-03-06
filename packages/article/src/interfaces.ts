export interface Text {
    kind: 'Text';
    text: string;
}

export interface PageLink {
    kind: 'PageLink';
    href: string;
    content: Content[];
}

export interface MultiPageLink {
    kind: 'MultiPageLink';
    href: string[];
    content: Content[];
}

export interface Name {
    kind: 'Name';
    text: string;
}

export interface Image {
    kind: 'Image';
    src: string;
    caption?: string;
}

export interface ContentListItem {
    kind: 'ContentListItem';
    content: Content[];
}

export interface ParagraphListItem {
    kind: 'ParagraphListItem';
    paragraphs: Paragraph[];
}

export interface List {
    kind: 'List';
    ordered: boolean;
    items: (ContentListItem | ParagraphListItem)[];
}

export interface Strong {
    kind: 'Strong';
    content: Content[];
}

export interface Emphasise {
    kind: 'Emphasise';
    content: Content[];
}

export interface Program {
    kind: 'Program';
    project?: string;
    language?: string;
    code: string;
    output?: string[];
}

export interface Plugin {
    kind: 'Plugin';
    plugin: {};
}

export type Content =
    | Text
    | PageLink
    | MultiPageLink
    | Name
    | Image
    | List
    | Strong
    | Emphasise
    | Program
    | Plugin
    ;

export interface Paragraph {
    kind: 'Paragraph';
    content: Content[];
}

export interface Topic {
    kind: 'Topic';
    anchor?: string;
    title: string;
    content: (Paragraph | Topic)[];
}

export interface Article {
    index: boolean;
    numberBeforeTitle: boolean;
    topic: Topic;
    anchors?: { [key: string]: Topic };
}
