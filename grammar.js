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
    ),
    module: $ => seq(
      "mod",
      field("id", $.identifier),
      "{",
      field("defs", repeat(choice(
        $.module,
        $._definition
      ))),
      "}"
    ),
    pipeline: $ => seq(
      "pipe", 
      field("id", $.identifier), 
      field("sources", $.sourceList),
      "{",
      $.pipelineStage,
      repeat(seq(
        repeat($.asyncOperation),
        $.pipelineStage
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
      $.sinkList,
      $._expression,
      $.sourceList
    ),

    sourceList: $ => seq(
      "(",
      optional(seq(
        $.sourceDef,
        optional(seq(
          ",",
          $.sourceDef
        ))
      )),
      ")"
    ),
    sourceDef: $ => seq(
      $.scopedIdentifier,
      optional(seq(":", $.type)),
    ),


    sinkList: $ => seq(
      "(",
      optional(seq(
        optional($.varDefPrefix),
        $.sinkDef,
        optional(seq(
          ",",
          $.sinkDef
        ))
      )),
      ")"
    ),
    sinkDef: $ => seq(
      $.identifier,
      ":",
      $._expression,
    ),
    varDefPrefix: $ => seq(
      'let',
      optional('mut'),
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
      seq("(", $._expression, ")"),
      prec(1, $.scopedIdentifier),
      $.assign
    ),
    _binary_expression: $ => prec(1, choice(
      $.add,
      $.sub,
      $.mul,
      $.div
    )),

    assign: $ => prec.right(0, seq(
      $._expression,
      "=",
      $._expression
    )),
    add: $ => prec.left(2, seq(
      $._expression,
      "+",
      $._expression
    )),
    sub: $ => prec.left(2, seq(
      $._expression,
      "-",
      $._expression
    )),
    mul: $ => prec.left(3, seq(
      $._expression,
      "*",
      $._expression
    )),
    div: $ => prec.left(3, seq(
      $._expression,
      "/",
      $._expression
    )),  

    scopedIdentifier: $ => prec.right(0, seq(
      field("id", $.identifier), 
      field("templateArgs", optional($.templateArguments)), 
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
  }
});
