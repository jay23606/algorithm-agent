package markup

import (
	"github.com/yuin/goldmark"
	"github.com/yuin/goldmark/ast"
	"github.com/yuin/goldmark/parser"
	"github.com/yuin/goldmark/text"
	"github.com/yuin/goldmark/util"
)

// mathInline is $...$ in the text.
type mathInline struct {
	ast.BaseInline
	value string
}

var kindMathInline = ast.NewNodeKind("MathInline")

func (n *mathInline) Kind() ast.NodeKind { return kindMathInline }

func (n *mathInline) Dump(src []byte, level int) {
	ast.DumpHelper(n, src, level, map[string]string{"Value": n.value}, nil)
}

type mathParser struct{}

func (mathParser) Trigger() []byte { return []byte{'$'} }

// Parse reads $...$. The opening $ must not be followed by a space, the closing $ must not follow a space, and the closing $ must not be followed by a digit, so that "$5 and $6" stays text.
func (mathParser) Parse(parent ast.Node, block text.Reader, pc parser.Context) ast.Node {
	line, _ := block.PeekLine()
	if len(line) < 3 || line[0] != '$' || line[1] == ' ' || line[1] == '$' {
		return nil
	}
	for i := 1; i < len(line); i++ {
		switch line[i] {
		case '\\':
			i++
		case '$':
			if line[i-1] == ' ' {
				return nil
			}
			if i+1 < len(line) && line[i+1] >= '0' && line[i+1] <= '9' {
				return nil
			}
			block.Advance(i + 1)
			return &mathInline{value: string(line[1:i])}
		case '\n':
			return nil
		}
	}
	return nil
}

func (r *codeRenderer) renderMathInline(w util.BufWriter, src []byte, n ast.Node, entering bool) (ast.WalkStatus, error) {
	if entering {
		r.formula(w, n.(*mathInline).value, false)
	}
	return ast.WalkSkipChildren, nil
}

type mathExt struct{}

func (mathExt) Extend(m goldmark.Markdown) {
	m.Parser().AddOptions(parser.WithInlineParsers(util.Prioritized(mathParser{}, 150)))
}
