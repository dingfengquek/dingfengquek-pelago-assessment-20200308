import * as rr from '../../result';
import * as mmLex from './parserModels';

// ---

const nameParser = (input: string, cursor: number): mmLex.ParseOutput<string> => {
    let nameEndIndex = cursor;
    for (; nameEndIndex<input.length; nameEndIndex++) {
        if (input[nameEndIndex] === '<' || input[nameEndIndex] === ',') {
            nameEndIndex = nameEndIndex;
            break;
        }
    }
    return {
        output: input.slice(cursor, nameEndIndex).trim(),
        cursor: nameEndIndex,
    };
};

const emailParser = (input: string, cursor: number): rr.Result<mmLex.ParseOutput<string | null>, string> => {
    if (cursor >= input.length || input[cursor] !== '<') {
        return rr.ok({ output: null, cursor });
    }
    const emailEndIndex = input.indexOf('>');
    if (emailEndIndex === -1) {
        return rr.err(`Error while parsing email: Could not find closing brackets '>' for opening brackets at ${cursor}. Input = [${input}].`);
    }
    return rr.ok({
        output: input.slice(cursor+1, emailEndIndex),
        cursor: emailEndIndex+1,
    });
};

const personParser = (input: string, cursor: number): rr.Result<mmLex.ParseOutput<mmLex.Person>, string> => {
    const nameParseOutput = nameParser(input, cursor);
    cursor = nameParseOutput.cursor;
    // ---
    const emailParseResult = emailParser(input, cursor);
    if (!emailParseResult.isOk) {
        return rr.err(`Error while parsing person at character ${cursor}: ${emailParseResult.err}`);
    }
    // ---
    // Skip whitespace and comma
    let newCursor = emailParseResult.ok.cursor;
    while (newCursor < input.length && input[newCursor] === ' ') {
        newCursor++;
    }
    if (newCursor < input.length) {
        if (input[newCursor] !== ',') {
            return rr.err(`Error while parsing person at character ${cursor}: No comma found after the person from characters ${cursor} to ${newCursor}, and not end of input. Input = [${input}]`);
        }
        newCursor += 1;
    }
    // ---
    return rr.ok({
        output: {
            name: nameParseOutput.output,
            email: emailParseResult.ok.output,
        },
        cursor: newCursor,
    });
};

export const personsParser = (input: string): rr.Result<readonly mmLex.Person[], string> => {
    const people: mmLex.Person[] = [];
    let cursor = 0;
    while (cursor < input.length) {
        const personParseResult = personParser(input, cursor);
        if (!personParseResult.isOk) {
            return rr.err(`Error while running peopleParser: ${personParseResult.err}`);
        }
        people.push(personParseResult.ok.output);
        if (cursor === personParseResult.ok.cursor) {
            return rr.err(`Error while running people parser: Parser could not advance cursor at character ${cursor}. Input = [${input}]`);
        }
        cursor = personParseResult.ok.cursor;

    }
    if (cursor !== input.length) {
        return rr.err(`Error while parsing with peopleParser: Could not parse the entire input [${input}], could only parsed until ${cursor}.`);
    }
    return rr.ok(people);
};
