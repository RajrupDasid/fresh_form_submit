import { connectToDatabase } from "../../util/util.ts";
import { Handlers, type PageProps } from "$fresh/server.ts";
import { verify } from "jsr:@denorg/scrypt@4.4.4";
import DOMPurify from "npm:isomorphic-dompurify";
import { create_token } from "../../util/jwttokengenerator.ts";

interface Props {
  email: string;
  password: string;
  message: string;
  useremail: string;
  userid: string;
  isadmin: boolean;
}

export const handler: Handlers<Props> = {
  async POST(req, ctx) {
    const formdata = await req.formData();
    const email = (formdata.get("email") || "") as string;
    const cleanemail = DOMPurify.sanitize(email);
    const password = (formdata.get("password") || "") as string;
    const cleanpassword = DOMPurify.sanitize(password);

    //importing jwt token's secret key

    const sql =
      `SELECT email, password,isadmin,uid FROM "User" WHERE email = '${cleanemail}'`;

    // Execute the SQL query
    const client = await connectToDatabase();
    try {
      const result = await client.queryObject(sql);
      const useremail = result.rows[0].email;
      if (!useremail) {
        console.log("no user found with this email");
      }
      const userpassword = result.rows[0].password;
      const userid = result.rows[0].uid;

      const isadmin = result.rows[0].isadmin;

      const verifypw = verify(cleanpassword, userpassword);
      if (verifypw === true) {
        const authtoken = create_token(userid, isadmin);

        const responseData = {
          message: "login  success",
          token: authtoken,
          admin: isadmin,
        };
        return new Response(JSON.stringify(responseData), {
          status: 200,
        });
      } else {
        const responseData = { message: "password doesnot match" };
        return new Response(JSON.stringify(responseData), {
          status: 400,
        });
      }

      //   const verifypw = verify()

      // Return a successful response
    } catch (error) {
      console.error("Error executing query:", error);

      const responseData = { message: "login faield " };

      return new Response(JSON.stringify(responseData), {
        headers: { Location: "/login" },
        status: 200,
      });
      // Return an error response
    } finally {
      await client.end();
    }
  },
};
