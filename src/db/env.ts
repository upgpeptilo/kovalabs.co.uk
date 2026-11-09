// Side-effect import for scripts: must be the first import so DATABASE_URL exists before ./index evaluates.
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
