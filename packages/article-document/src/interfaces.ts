export interface DocArticle {
    symbolId: string;
    accessor?: 'public' | 'protected' | 'private';
    category: 'Enum' | 'Class' | 'Struct' | 'Union' | 'TypeAlias' | 'Variable' | 'ValueAlias' | 'Namespace' | 'Function';
    name: string;
}
