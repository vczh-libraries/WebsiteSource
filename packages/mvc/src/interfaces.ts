export type RouterParameterTypes =
    | string
    | number
    | boolean
    ;

export type HttpMethods =
    | 'GET'
    | 'HEAD'
    | 'POST'
    | 'PUT'
    | 'DELETE'
    | 'CONNECT'
    | 'OPTIONS'
    | 'TRACE'
    | 'PATCH'
    ;

export enum RouterFragmentKind {
    Text,
    Free,
    Head,
    Tail,
    HeadTail,
    MultiplePatterns,
    PatternArray
}

export enum RouterParameterKind {
    String,
    Number,
    Boolean,
    Array
}

export type RouterParameter = [string, RouterParameterKind];

export type RouterFragment =
    | {
        kind: RouterFragmentKind.Text;
        text: string;
    }
    | {
        kind: RouterFragmentKind.Free;
        parameter: RouterParameter;
    }
    | {
        kind: RouterFragmentKind.Head;
        head: string;
        parameter: RouterParameter;
    }
    | {
        kind: RouterFragmentKind.Tail;
        tail: string;
        parameter: RouterParameter;
    }
    | {
        kind: RouterFragmentKind.HeadTail;
        head: string;
        tail: string;
        parameter: RouterParameter;
    }
    | {
        kind: RouterFragmentKind.MultiplePatterns;
        pattern: string;
        parameters: RouterParameter[];
        cachedRegExp?: RegExp;
    }
    | {
        kind: RouterFragmentKind.PatternArray;
        head: string;
        tail: string;
        parameter: RouterParameter;
    };

export interface RouterPatternBase {
    readonly fragments: RouterFragment[];
    createDefaultValue(): {};
    walk(text: string, fragment: RouterFragment, value: {}): boolean;
}

export interface RouterPattern<T extends {}> extends RouterPatternBase {
    createDefaultValue(): T;
    walk(text: string, fragment: RouterFragment, value: T): boolean;
}

export type RouterCallback<TModel, TResult> = (method: HttpMethods, model: TModel) => TResult | undefined;

export interface Router<TResult> {
    readonly registered: readonly RouterPatternBase[];
    readonly pathPrefix: string;
    register<TModel extends {}>(methods: HttpMethods[], pattern: RouterPattern<TModel>, callback: RouterCallback<TModel, TResult>): void;
    match(method: HttpMethods, query: string): TResult | undefined;
}
