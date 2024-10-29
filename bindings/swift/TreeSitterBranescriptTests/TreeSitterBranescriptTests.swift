import XCTest
import SwiftTreeSitter
import TreeSitterBranescript

final class TreeSitterBranescriptTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_branescript())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Branescript grammar")
    }
}
