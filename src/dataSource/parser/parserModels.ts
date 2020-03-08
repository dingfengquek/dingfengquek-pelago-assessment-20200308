// Parsing Helpers

export interface ParseOutput<T> {
    readonly output: T;
    readonly cursor: number;
}

export interface Person {
    readonly name: string;
    readonly email: string | null;
}

// --- Line Representation ---

export interface LineEntryLine1 {
    type: 'propLine1';
    name: string;
    value: string;
}

export interface LineEntryLine2OrMore {
    type: 'propLine>1';
    value: string;
}

export interface LineEmpty {
    type: 'empty';
}

export type Line = LineEntryLine1 | LineEntryLine2OrMore | LineEmpty;

// --- Prop Group Representation ---

export interface Prop {
    readonly name: string;
    readonly value: string;
}

export type PropGroup = readonly Prop[];
