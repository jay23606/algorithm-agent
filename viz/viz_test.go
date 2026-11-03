package viz

import (
	"os/exec"
	"strings"
	"testing"
)

func TestBuildAndCheck(t *testing.T) {
	b, err := Build("testdata/ok/scene.ts", true)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(b), "AlgoScenes") {
		t.Fatalf("the bundle does not register the scene")
	}
	if _, err := exec.LookPath("node"); err != nil {
		t.Skip("node is not installed")
	}
	presets := []Preset{{"empty", []int{}}, {"one", []int{5}}, {"three", []int{3, 1, 2}}}
	r := Check("demo", b, presets, []string{"L1", "L2"})
	if len(r.Fails) > 0 {
		t.Fatalf("fails: %v", r.Fails)
	}
	r = Check("demo", b, presets[:1], []string{"L1", "L2", "L3"})
	if len(r.Fails) != 2 {
		t.Fatalf("want 2 fails (V10, and V05 for L2 and L3), got %v", r.Fails)
	}
}

func TestOnlyViz(t *testing.T) {
	_, err := Build("testdata/bad/scene.ts", false)
	if err == nil || !strings.Contains(err.Error(), "V01") {
		t.Fatalf("want a V01 error, got %v", err)
	}
}
