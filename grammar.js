/**
 * @file Parser for BraneScript's text representation
 * @author WireWhiz
 * @license Apachie 2.0
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check


module.exports = grammar({
    name: "branescript",

    rules: {
        source_file: $ => repeat($.module),
        _definition: $ => choice(
            $.pipeline,
            $.function,
            $.module,
        ),
        module: $ => seq(
            "mod",
            field("id", $.identifier),
            "{",
            field("defs", repeat($._definition)),
            "}"
        ),
        pipeline: $ => seq(
            "pipe",
            field("id", $.identifier),
            field("callSig", $.callSig),
            "[",
            field("stages", seq(
                repeat($.pipelineStage)
            )),
            "]",
        ),
        function: $ => seq(
            "func",
            $.scopedIdentifier,
            $.callSig,
            $.block,
        ),
        callSig: $ => seq(
            field("input", $.anonStructType),
            optional(seq(
                "->",
                field("output", $.anonStructType)
            ))
        ),
        anonStructType: $ => seq(
            "(",
            optional(seq(
                $.valueDef,
                optional(repeat(seq(
                    ",",
                    $.valueDef
                )))
            )),
            ")"
        ),
        call: $ => seq(
            field("func", $.expression),
            field("args", $.anonStruct)
        ),
        valueDef: $ => prec(5, seq(
            field("mut", optional("mut")),
            field("id", $.identifier),
            optional(seq(":", field("type", $.type))),
        )),
        memberInit: $ => seq(
            field("id", $.identifier),
            ":",
            field("value", $.expression),
        ),
        anonStruct: $ => seq(
            "(",
            optional(seq(
                $.memberInit,
                optional(repeat(seq(
                    ",",
                    $.memberInit
                )))
            )),
            ")"
        ),
        variableDefinition: $ => prec.left(4, seq(
            'let',
            field("def", $.valueDef),
        )),

        pipelineStage: $ => seq(
            field("callSig", optional($.callSig)),
            field("body", $.block)
        ),
        block: $ => seq(
            "{",
            field("expressions", repeat(seq(
                $.expression,
                ";"
            ))),
            optional(field("return", $.expression)),
            "}"
        ),
        expression: $ => choice(
            $.binary_operator,
            $.number,
            prec(17, $.scopedIdentifier),
            prec(18, seq("(", $.expression, ")")),
            prec(19, $.anonStruct),
            prec(20, $.call),
            $.assign,
            $.variableDefinition
        ),
        binary_operator: $ => prec.left(3, seq(
            field("left", $.expression),
            field("operator", choice(
                prec(11, choice(".", "->")),
                prec(10, choice("*", "/", "%")),
                prec(9, choice("+", "-")),
                prec(8, choice("<<", ">>")),
                prec(7, choice("<", "<=", ">=", ">")),
                prec(6, choice("==", "!=")),
                prec(5, "&"),
                prec(4, "^"),
                prec(3, "|"),
                prec(2, "&&"),
                prec(1, "||"),
            )),
            field("right", $.expression)
        )),
        assign: $ => prec.right(0, seq(
            field("left", $.expression),
            "=",
            field("right", $.expression)
        )),
        scopedIdentifierSegment: $ => prec.right(16, choice(
            field("id", $.identifier),
            seq(field("id", $.identifier), field("generic", $.templateArguments)),
        )),
        scopedIdentifier: $ => seq(
            $.scopedIdentifierSegment,
            optional(seq(
                "::",
                $.scopedIdentifierSegment
            ))
        ),
        templateArguments: $ => seq(
            "<",
            $.templateArgument,
            repeat(seq(
                ",",
                $.templateArgument
            )),
            ">"
        ),
        templateArgument: $ => choice(
            $.type
        ),
        refOp: $ => seq(
            '&',
            optional(choice(
                field('mut', 'mut'),
                field('const', 'const')
            )),
        ),
        type: $ => seq(
            field('refOp', repeat($.refOp)),
            field('id', $.scopedIdentifier)
        ),

        identifier: $ => /[a-zA-Z_]([a-zA-Z0-9_]*)/,
        number: $ => /\d+/,
        comment: _ => token(choice(
            seq('//', /(\\+(.|\r?\n)|[^\\\n])*/),
            seq(
                '/*',
                /[^*]*\*+([^/*][^*]*\*+)*/,
                '/',
            ),
        ))
    },
    extras: $ => [
        /\s|\\\r?\n/,
        $.comment,
    ]
});
