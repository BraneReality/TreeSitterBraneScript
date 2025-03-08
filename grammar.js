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
            field("func", $._expression),
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
            field("value", $._expression),
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
                $._expression,
                ";"
            ))),
            optional(field("return", $._expression)),
            "}"
        ),
        _expression: $ => choice(
            $._binary_expression,
            prec(1, $.number),
            prec(1, $.scopedIdentifier),
            prec(2, seq("(", $._expression, ")")),
            prec(2, $.anonStruct),
            prec(3, $.call),
            $.assign,
            $.variableDefinition
        ),
        _binary_expression: $ => prec(1, choice(
            $.add,
            $.sub,
            $.mul,
            $.div
        )),

        assign: $ => prec.right(0, seq(
            field("left", $._expression),
            "=",
            field("right", $._expression)
        )),
        add: $ => prec.left(2, seq(
            field("left", $._expression),
            "+",
            field("right", $._expression)
        )),
        sub: $ => prec.left(2, seq(
            field("left", $._expression),
            "-",
            field("right", $._expression)
        )),
        mul: $ => prec.left(3, seq(
            field("left", $._expression),
            "*",
            field("right", $._expression)
        )),
        div: $ => prec.left(3, seq(
            field("left", $._expression),
            "/",
            field("right", $._expression)
        )),
        scopedIdentifierSegment: $ => choice(
            field("id", $.identifier),
            seq(field("generic", $.identifier), field("id", $.templateArguments)),
        ),
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

        type: $ => seq(
            repeat(seq(
                '&',
                optional(choice('mut', 'const')),
            )),
            $.scopedIdentifier
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
