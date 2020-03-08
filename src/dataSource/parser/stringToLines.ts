import * as rr from '../../result';
import * as mm from './parserModels';

// ---

export const parseLine = (input: string, cursor: number): rr.Result<mm.Line, string> => {
    // Get indent length
    let indentLength = 0;
    for (let i=0; i<input.length; i++) {
        // Indents can be made out of spaces or tab characters.
        // They are mostly spaces, but in some R packages, tabs are used
        // (and is mixed with spaces, even in the same package).
        if (input[i] !== ' ' && input[i] !== '\t') {
            indentLength = i;
            break;
        }
    }
    // ---
    // Do logic based on indent length
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
        // Any amount of indentation, even if it is "jagged", should pass.
        // There are packages where the indentation is "jagged".
        default: return rr.ok({ type: 'propLine>1', value: input.substring(indentLength) });
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
