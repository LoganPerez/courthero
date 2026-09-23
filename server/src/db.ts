import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Pool } = pg;

function createPool() {
  const raw = process.env.DATABASE_URL ?? "";

  if (!raw) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  // Parse connection details cleanly to handle any special characters in the password
  // (e.g. '@', ':', '#', '!', '%', etc.) without failing URL parsing.
  try {
    const withoutScheme = raw.replace(/^(postgresql|postgres):\/\//, "");
    const lastAtIndex = withoutScheme.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const credentials = withoutScheme.slice(0, lastAtIndex);
      const hostPart = withoutScheme.slice(lastAtIndex + 1);

      const firstColonIndex = credentials.indexOf(":");
      const user = firstColonIndex !== -1 ? credentials.slice(0, firstColonIndex) : credentials;
      const rawPassword = firstColonIndex !== -1 ? credentials.slice(firstColonIndex + 1) : "";

      // Extract host, port, database
      const slashIndex = hostPart.indexOf("/");
      const hostAndPort = slashIndex !== -1 ? hostPart.slice(0, slashIndex) : hostPart;
      const rest = slashIndex !== -1 ? hostPart.slice(slashIndex + 1) : "";
      const [databaseName] = rest.split("?");

      let host = hostAndPort;
      let port = 5432;
      if (hostAndPort.includes(":")) {
        const [h, p] = hostAndPort.split(":");
        host = h || "localhost";
        port = parseInt(p || "5432", 10) || 5432;
      }

      const isLocal =
        host === "localhost" ||
        host === "127.0.0.1" ||
        host === "db" ||
        host === "0.0.0.0";

      return new Pool({
        host,
        port,
        user: decodeURIComponent(user),
        password: rawPassword, // passed directly so special chars never break URL parsers
        database: databaseName || "postgres",
        ssl: isLocal ? false : { rejectUnauthorized: false },
      });
    }
  } catch (err) {
    console.warn("Failed custom DATABASE_URL parsing, falling back to connectionString:", err);
  }

  return new Pool({
    connectionString: raw,
    ssl: { rejectUnauthorized: false },
  });
}

const pool = createPool();

export default pool;
