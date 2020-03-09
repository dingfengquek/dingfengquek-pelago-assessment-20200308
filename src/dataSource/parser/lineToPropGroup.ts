import * as rr from '../../result';
import * as mm from './parserModels';

// ---

const parseProp = (input: readonly mm.Line[], cursor: number): rr.Result<mm.ParseOutput<mm.Prop>, string> => {
    // Check that first line is a <PropertyName>: <PropertyValue>
    const firstLine = input[cursor];
    if (firstLine.type === 'empty') {
        return rr.err(`Error at line ${cursor+1}: Expected start of package property, but found an empty line instead.`);
    }
    if (firstLine.type === 'propLine>1') {
        return rr.err(`Error at line ${cursor+1}: Expected start of package property, but found an indented line instead. Package property should not be indented.`);
    }
    // ---
    const name = firstLine.name;
    let value = firstLine.value;
    // ---
    // Attach subsequent line that are indented (propLine>1); Break once there are no indented lines
    for (let i=cursor+1; i<input.length; i++) {
        const line = input[i];
        switch (line.type) {
            case 'empty': 
            case 'propLine1': return rr.ok({ output: { name, value }, cursor: i });
            case 'propLine>1': value += ' ' + line.value;
        }
    }
    // ---
    return rr.ok({ output: { name, value }, cursor: input.length });
};

const parseToPropGroup = (input: readonly mm.Line[], cursor: number): rr.Result<mm.ParseOutput<mm.PropGroup>, string> => {
    // Error if first line is empty. If the error is not returned here, it will skip empty lines for an empty PropGroup later.
    if (input[cursor].type === 'empty') {
        return rr.err(`[parseToPropGroup] Error: First line sould not be empty.`);
    }
    const props: mm.Prop[] = [];
    while (cursor < input.length) {
        // Break if the current line is empty
        if (input[cursor].type === 'empty') {
            break;
        }
        // Parse prop
        const parsePropResult = parseProp(input, cursor);
        if (!parsePropResult.isOk) {
            return rr.err(`[parseToPropGroup] Error while parsing to PropGroup at line ${cursor+1}: Error while parsing prop: ${parsePropResult.err}.`);
        }
        const parsePropOutput = parsePropResult.ok;
        // Check for stuck cursor
        if (parsePropOutput.cursor === cursor) {
            return rr.err(`[parseToPropGroup] Error while parsing to PropGroup at line ${cursor+1}: parseToPackage parser could not advance cursor, this is most likely a bug in the parser.`);
        }
        // Add value and advance cursor
        props.push(parsePropOutput.output);
        cursor = parsePropOutput.cursor;
    }
    // Skip empty lines after
    while (cursor < input.length && input[cursor].type === 'empty') {
        cursor += 1;
    }
    // ---
    return rr.ok({ output: props, cursor });
};

export const parseToPropGroups = (input: readonly mm.Line[]): rr.Result<readonly mm.PropGroup[], string> => {
    const packages: mm.PropGroup[] = [];
    let cursor = 0;
    // Skip empty lines
    while (cursor < input.length && input[cursor].type === 'empty') {
        cursor += 1;
    }
    // ---
    while (cursor < input.length) {
        // Parse to PropGroup
        const parseToPropGroupResult = parseToPropGroup(input, cursor);
        if (!parseToPropGroupResult.isOk) {
            return rr.err(`[parseToPropGroups] Error while parsing to package at line ${cursor+1}: ${parseToPropGroupResult.err}`);
        }
        // ---
        // Check for stuck cursor
        if (parseToPropGroupResult.ok.cursor === cursor) {
            return rr.err(`[parseToPropGroups] Error while parsing to package at line ${cursor+1}: Parser could not advance cursor, this is most likely a bug in the parser.`);
        }
        // ---
        // Skip empty lines
        cursor = parseToPropGroupResult.ok.cursor;
        while (cursor < input.length && input[cursor].type === 'empty') {
            cursor += 1;
        }
        // ---
        packages.push(parseToPropGroupResult.ok.output);
    }
    // ---
    return rr.ok(packages);
};

