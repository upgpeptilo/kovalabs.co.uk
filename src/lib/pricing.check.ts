// run: npx tsx src/lib/pricing.check.ts
import { pctFor, lineTotal } from "./pricing";
const eq = (a: unknown, b: unknown) => { if (a !== b) throw new Error(`${a} !== ${b}`); };
eq(pctFor("tesamorelin", 2), 0); eq(pctFor("tesamorelin", 3), 10); eq(pctFor("tesamorelin", 5), 20); eq(pctFor("tesamorelin", 10), 25);
eq(pctFor("cellular-stack", 10), 0); eq(lineTotal(7999, 3, 10), 21597);
console.log("pricing ok");
