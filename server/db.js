import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

const adapter = new JSONFile("database.json");
const db = new Low(adapter, { users: [] });

await db.read();
db.data ||= { users: [] };

export default db;
