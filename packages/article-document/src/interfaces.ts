export const acceptableAccessors = (<const>['', 'public', 'protected', 'private']);
export const acceptableCategories = (<const>['Enum', 'Class', 'Struct', 'Union', 'TypeAlias', 'Variable', 'ValueAlias', 'Namespace', 'Function']);

export interface DocSymbol {
    docId?: string;
    declFile: string;
    declId: string;
}

export interface DocArticle {
    symbolId: string;
    accessor: typeof acceptableAccessors[number];
    category: typeof acceptableCategories[number];
    name: string;

    signature?: string;
    example?: string;
    basetypes?: DocSymbol[];
    seealsos?: DocSymbol[];
}
