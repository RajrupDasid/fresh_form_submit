import jwt from "npm:jsonwebtoken";
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
import { crypto } from "https://deno.land/std@0.214.0/crypto/crypto.ts";

const env = await load();
const secret_key = env["SECRET_KEY"];

interface Props {
  data: string;
}

export function create_token({ data }: Props): string {
  const token = jwt.sign({ data: data }, secret_key, {
    algorithm: "HS256",
    expiresIn: "1h",
  });
  return token;
}
