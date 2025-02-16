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
      field("sources", $.sourceList),
      "{",
      field("stages", seq(
        $.pipelineStage,
        repeat(seq(
          repeat($.asyncOperation),
          $.pipelineStage
        ))
      )),
      "}",
      field("sinks", $.sinkList)
    ),
    function: $ => seq(
      "func",
      $.scopedIdentifier,
      $.sourceList,
      $.block,
      $.sinkList,
    ),
    asyncOperation: $ => choice(
      seq("call", $.call),
      seq("hold", $.identifier, repeat(seq(",", $.identifier)))
    ),
    call: $ => seq(
      $.sourceList,
      $._expression,
      $.sinkList
    ),
    sourceList: $ => seq(
      "(",
      optional(seq(
        $.sourceDef,
        optional(repeat(seq(
          ",",
          $.sourceDef
        )))
      )),
      ")"
    ),
    sourceDef: $ => prec(5, seq(
      field("mut", optional("mut")),
      field("id", $.identifier),
      optional(seq(":", field("type", $.type))),
    )),
    sinkList: $ => seq(
      "(",
      optional(seq(
        $.sinkDef,
        optional(repeat(seq(
          ",",
          $.sinkDef
        )))
      )),
      ")"
    ),
    sinkDef: $ => seq(
      field("id", $.identifier),
      ":",
      field("value", $._expression),
    ),
    variableDefinition: $ => seq(
      'let',
      field("mut", optional('mut')),
      field("id", $.identifier),
      optional(seq(
        ":",
        field("type", $.type)
      ))
    ),

    pipelineStage: $ => seq(
      "[",
      repeat(seq(
        $._expression,
        ";"
      )),
      "]"
    ),
    block: $ => seq(
      "{",
      repeat(seq(
        $._expression,
        ";"
      )),
      "}"
    ),
    _expression: $ => choice(
      $._binary_expression,
      prec(1, $.number),
      prec(2, seq("(", $._expression, ")")),
      prec(3, $.call),
      prec(1, $.scopedIdentifier),
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

    scopedIdentifier: $ => prec.right(0, seq(
      choice(
        field("id", $.identifier),
        field("templateArgs", $.templateArguments),
      ),
      field("child", optional(seq(
        "::",
        $.scopedIdentifier
      )))
    )),

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
  },
  extras: $ => [
    /\s+/,
    /\/\/.*\n/,
    /\/\*[\s\S]*?\*\//
  ]
});
