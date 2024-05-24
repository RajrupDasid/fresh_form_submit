import { Handlers, type PageProps } from "$fresh/server.ts";
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
import { Client } from "https://deno.land/x/postgres/mod.ts";

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

interface Props {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  message: string;
}
export const handler: Handlers<Props> = {
  async POST(req, ctx) {
    const formdata = await req.formData();
    console.log(formdata);
    const firstname = formdata.get("first_name");
    const lastname = formdata.get("last_name");
    const email = formdata.get("email");
    const password = formdata.get("password");

    const sqlquery =
      `INSERT INTO "User" (firstname, lastname, email, password) VALUES ($1, $2, $3, $4)`;
    const values = [firstname, lastname, email, password];

    try {
      const result = await client.queryArray(sqlquery, values);
      console.log(result);

      const responseData = { message: "Signup successful" };
      return new Response(JSON.stringify(responseData), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    } catch (error) {
      console.error(error);
      const responseData = { message: "Signup failed" };
      return new Response(JSON.stringify(responseData), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      });
    } finally {
      await client.end(); // Close the client connection
    }
  },
};
