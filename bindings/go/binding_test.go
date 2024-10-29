package tree_sitter_branescript_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_branescript "github.com/wirewhiz/treesitterbranescript/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_branescript.Language())
	if language == nil {
		t.Errorf("Error loading Branescript grammar")
	}
}
