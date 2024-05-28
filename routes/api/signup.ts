import { Handlers, type PageProps } from "$fresh/server.ts";
import { hash } from "jsr:@denorg/scrypt@4.4.4";
import DOMPurify from "npm:isomorphic-dompurify";
import { connectToDatabase } from "../../util/util.ts";

// const env = await load();
// const dbuser = env["DB_USER"];

// const database = env["DATABASE"];
// const hostname = env["HOST_NAME"];
// const password = env["PASSWORD"];
// const client = new Client({
//   user: dbuser,
//   database: database,
//   hostname: hostname,
//   password: password,
//   port: 5432,
//   tls: {
//     enforce: true,
//   },
// });
// await client.connect();

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
    const firstname = (formdata.get("first_name") || "") as string;
    const lastname = (formdata.get("last_name") || "") as string;
    const email = (formdata.get("email") || "") as string;
    const password = (formdata.get("password") || "") as string;
    const hashpw = hash(password);
    const isadmin = false;
    const uuid = crypto.randomUUID();
    // cleaning data before saving
    const clean_firstname = DOMPurify.sanitize(firstname);
    const clean_lastname = DOMPurify.sanitize(lastname);
    const clean_email = DOMPurify.sanitize(email);

    const sqlquery =
      `INSERT INTO "User" (firstname, lastname, email, password,isadmin,uid) VALUES ($1, $2, $3, $4,$5,$6)`;
    const values = [
      clean_firstname,
      clean_lastname,
      clean_email,
      hashpw,
      isadmin,
      uuid,
    ];
    try {
      const client = await connectToDatabase();
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
    }
  },
};
