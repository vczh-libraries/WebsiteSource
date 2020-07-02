import { HttpMethods, Router, RouterCallback, RouterFragmentKind, RouterPattern, RouterPatternBase } from './interfaces';

interface RouterPackage<TResult> {
    methods: HttpMethods[];
    pattern: RouterPatternBase;
    callback(method: HttpMethods, model: {}): TResult;
}

class RouterImpl<TResult> implements Router<TResult> {
    private readonly patterns: RouterPackage<TResult>[] = [];

    constructor(public readonly pathPrefix: string) { }

    public get registered(): readonly RouterPatternBase[] {
        return this.patterns.map((value: RouterPackage<TResult>) => value.pattern);
    }

    public register<TModel>(methods: HttpMethods[], pattern: RouterPattern<TModel>, callback: RouterCallback<TModel, TResult>): void {
        this.patterns.push({
            methods: methods.length === 0 ? ['GET'] : methods,
            pattern,
            callback
        });
    }

    public match(method: HttpMethods, query: string): TResult | undefined {
        let normalizedQuery = query;
        if (normalizedQuery.startsWith(this.pathPrefix)) {
            normalizedQuery = normalizedQuery.substr(this.pathPrefix.length);
        } else {
            return undefined;
        }

        if (normalizedQuery[0] !== '/') {
            throw new Error('Query should begin with "/".');
        }

        const fragments = normalizedQuery.split('/');
        let result: TResult | undefined;

        PATTERN_LOOP: for (const pattern of this.patterns) {
            if (pattern.methods.indexOf(method) !== -1) {
                const rp = pattern.pattern;
                if (endsWithPatternArray(rp)) {
                    if (rp.fragments.length > fragments.length - 1) {
                        continue PATTERN_LOOP;
                    }
                } else {
                    if (rp.fragments.length !== fragments.length - 1) {
                        continue PATTERN_LOOP;
                    }
                }

                const model = rp.createDefaultValue();
                for (let i = 0; i < rp.fragments.length; i++) {
                    const isPatternArray = rp.fragments[i].kind === RouterFragmentKind.PatternArray;
                    const textToMatch = isPatternArray ? fragments.slice(i + 1).join('/') : fragments[i + 1];
                    if (!rp.walk(textToMatch, rp.fragments[i], model)) {
                        continue PATTERN_LOOP;
                    }
                    if (isPatternArray) {
                        break;
                    }
                }

                if (result === undefined) {
                    result = pattern.callback(method, model);
                } else {
                    throw new Error(`Multiple patterns match query: "${normalizedQuery}".`);
                }
            }
        }
        return result;
    }
}

export function endsWithPatternArray(rp: RouterPatternBase): boolean {
    return rp.fragments.length > 0 && rp.fragments[rp.fragments.length - 1].kind === RouterFragmentKind.PatternArray;
}

export function createRouter<TResult>(pathPrefix?: string): Router<TResult> {
    return new RouterImpl<TResult>(pathPrefix === undefined ? '' : pathPrefix);
}
