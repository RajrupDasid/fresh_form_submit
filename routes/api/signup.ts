import { Handlers, type PageProps } from "$fresh/server.ts";
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
import { Client } from "https://deno.land/x/postgres@v0.19.3/mod.ts";
import { hash } from "jsr:@denorg/scrypt@4.4.4";
import * as mod from "https://deno.land/std@0.224.0/uuid/mod.ts";

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
    const firstname = formdata.get("first_name") || "";
    const lastname = formdata.get("last_name") || "";
    const email = formdata.get("email") || "";
    const password = (formdata.get("password") || "") as string;
    const hashpw = hash(password);
    const isadmin = false;
    const uuid = crypto.randomUUID();
    const sqlquery =
      `INSERT INTO "User" (firstname, lastname, email, password,isadmin,uid) VALUES ($1, $2, $3, $4,$5,$6)`;
    const values = [firstname, lastname, email, hashpw, isadmin, uuid];

    try {
      const result = await client.queryArray(sqlquery, values);

      const responseData = { message: "Signup success" };
      return new Response(JSON.stringify(responseData), {
        headers: { Location: "/login" },
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
