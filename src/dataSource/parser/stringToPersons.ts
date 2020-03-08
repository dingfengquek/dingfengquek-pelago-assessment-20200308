import * as rr from '../../result';
import * as mmLex from './parserModels';

// ---

const nameParser = (input: string, cursor: number): rr.Result<mmLex.ParseOutput<string>, string> => {
    let nameEndIndex = cursor;
    for (; nameEndIndex<input.length; nameEndIndex++) {
        // Handle square brackets. This can/should be refactored out to another bracket parser.
        if (input[nameEndIndex] === '[') {
            // Skip until closing square brackets
            while (nameEndIndex < input.length && input[nameEndIndex] !== ']') {
                nameEndIndex += 1;
            }
            if (nameEndIndex >= input.length) {
                return rr.err(`[nameParser] Error while parsing inside open square brackets '[' ']': Could not find close brackets`);
            }
            // Now the next loop will increment to after the closing square brackets
            continue;
        }
        // Handle square brackets. This can/should be refactored out to another bracket parser.
        if (input[nameEndIndex] === '(') {
            // Skip until closing square brackets
            while (nameEndIndex < input.length && input[nameEndIndex] !== ')') {
                nameEndIndex += 1;
            }
            if (nameEndIndex >= input.length) {
                return rr.err(`[nameParser] Error while parsing inside open square brackets '(' ')': Could not find close brackets`);
            }
            // Now the next loop will increment to after the closing round brackets
            continue;
        }
        if (input[nameEndIndex] === '<' || input[nameEndIndex] === ',') {
            break;
        }
    }
    return rr.ok({
        output: input.slice(cursor, nameEndIndex).trim(),
        cursor: nameEndIndex,
    });
};

const emailParser = (input: string, cursor: number): rr.Result<mmLex.ParseOutput<string | null>, string> => {
    if (cursor >= input.length || input[cursor] !== '<') {
        return rr.ok({ output: null, cursor });
    }
    const emailEndIndex = input.indexOf('>', cursor);
    if (emailEndIndex === -1) {
        return rr.err(`Error while parsing email: Could not find closing brackets '>' for opening brackets at ${cursor}. Input = [${input}].`);
    }
    return rr.ok({
        output: input.slice(cursor+1, emailEndIndex),
        cursor: emailEndIndex+1,
    });
};

const personParser = (input: string, cursor: number): rr.Result<mmLex.ParseOutput<mmLex.Person>, string> => {
    const nameParseResult = nameParser(input, cursor);
    if (!nameParseResult.isOk) {
        return rr.err(`[personParser] Error when parsing name: ${nameParseResult.err}`);
    }
    cursor = nameParseResult.ok.cursor;
    // ---
    const emailParseResult = emailParser(input, cursor);
    if (!emailParseResult.isOk) {
        return rr.err(`Error while parsing person at character ${cursor}: ${emailParseResult.err}`);
    }
    // ---
    // Skip whitespace and comma
    let newCursor = emailParseResult.ok.cursor;
    while (newCursor < input.length && (input[newCursor] === ' ' || input[newCursor] === '\t')) {
        newCursor++;
    }
    if (newCursor < input.length) {
        if (input[newCursor] === ',') {
            newCursor += 1;
        } else {
            // The check for comma after email is removed due to other-format packages like abind@1.4-5.
            // Their format has <name1> <email1> and <name2> which will be wrongly parsed into
            // ("<name1>", "<email1>") ("and <name2>", null). But at least it won't stop the whole thing.
            // This is a best-effort since there is no given schema/format for the person-strings.
            // return rr.err(`Error while parsing person at character ${cursor}: No comma found after the person from characters ${cursor} to ${newCursor}, and not end of input. Input = [${input}]`);
            // newCursor += 1;
        }
    }
    // ---
    return rr.ok({
        output: {
            name: nameParseResult.ok.output,
            email: emailParseResult.ok.output,
        },
        cursor: newCursor,
    });
};

export const personsParser = (input: string): rr.Result<readonly mmLex.Person[], string> => {
    const persons: mmLex.Person[] = [];
    let cursor = 0;
    while (cursor < input.length) {
        const personParseResult = personParser(input, cursor);
        if (!personParseResult.isOk) {
            return rr.err(`[personsParser] Error: ${personParseResult.err}`);
        }
        persons.push(personParseResult.ok.output);
        if (cursor === personParseResult.ok.cursor) {
            return rr.err(`[personsParser] Error: Parser could not advance cursor at character ${cursor}. Input = [${input}]`);
        }
        cursor = personParseResult.ok.cursor;
    }
    if (cursor !== input.length) {
        return rr.err(`[personsParser] Error: Could not parse the entire input [${input}], could only parse until ${cursor}.`);
    }
    return rr.ok(persons);
};
