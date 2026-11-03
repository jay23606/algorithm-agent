import { scene } from "@algo/viz";
import { readFileSync } from "fs";

export default scene({ slug: "bad", input: { type: "int" }, run() { return readFileSync; } });
