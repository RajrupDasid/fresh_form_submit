import jwt from "npm:jsonwebtoken";
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";

const env = await load();
const secret_key = env["SECRET_KEY"];

interface Props {
  userid: string;
  isadmin: boolean;
}

export function create_token(userid: Props, isadmin: Props) {
  const token = jwt.sign({ userid, isadmin }, secret_key, {
    algorithm: "HS256",
    expiresIn: "1h",
  });
  return token;
}
