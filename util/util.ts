import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
import { Client } from "https://deno.land/x/postgres@v0.19.3/mod.ts";

export async function connectToDatabase(): Promise<Client> {
  const env = await load();
  const dbuser = env["DB_USER"];
  const database = env["DATABASE"];
  const hostname = env["HOST_NAME"];
  const password = env["PASSWORD"];

  const client = new Client({
    user: dbuser,
    database: database,
    hostname: hostname,
    password: password,
    port: 5432,
    tls: {
      enforce: true,
    },
  });

  await client.connect();
  return client;
}
