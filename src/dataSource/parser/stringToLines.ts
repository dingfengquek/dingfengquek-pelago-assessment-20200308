import * as rr from '../../result';
import * as mm from './parserModels';

// ---

export const parseLine = (input: string, cursor: number): rr.Result<mm.Line, string> => {
    // Get indent length
    let indentLength = 0;
    for (let i=0; i<input.length; i++) {
        if (input[i] !== ' ') {
            indentLength = i;
            break;
        }
    }
    // ---
    // Do logic based on indent length
    // All empty
    if (indentLength === input.length) { 
        return rr.ok({ type: 'empty' });
    }
    switch (indentLength) {
        // Not indented, should be first line of a property
        case 0: { 
            const indexOfColon = input.indexOf(':');
            if (indexOfColon === -1) {
                return rr.err(`Error at line ${cursor+1}: No colon found. Unindented lines must start a property declaration and have a colon.`);
            }
            const name = input.substring(0, indexOfColon).trimRight();
            const value = input.substring(indexOfColon+1).trim();
            return rr.ok({ type: 'propLine1', name, value });
        }
        // Is indented, should be 2nd or later lines of a property
        case 8: return rr.ok({ type: 'propLine>1', value: input.substring(8) });
        default: return rr.err(`Error at line ${cursor+1}: Line is not indented by 8 spaces, only 8-spaces tabs/indents are allowed.: ${input}`)
    }
};

export const parseToLines = (input: readonly string[]): rr.Result<readonly mm.Line[], string> => {
    const errors: string[] = [];
    const lines: mm.Line[] = [];
    // Parse every line; Errors are accumulated (does not return on first error)
    for (let i=0; i<input.length; i++) {
        const line = input[i];
        const parseResult = parseLine(line, i);
        if (!parseResult.isOk) {
            errors.push(`Error while lexing to lines: ${parseResult.err}`);
            continue;
        }
        lines.push(parseResult.ok);
    }
    // ---
    if (errors.length > 0) {
        return rr.err(errors.join('\n'));
    }
    return rr.ok(lines);
};
