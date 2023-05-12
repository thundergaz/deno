import query from "https://esm.sh/faunadb@4.7.1";
import Client from "https://esm.sh/faunadb@4.7.1";

// Grab the secret from the environment.
const token = Deno.env.get("FAUNA_SECRET");
if (!token) {
  throw new Error("environment variable FAUNA_SECRET not set");
}

var client = new Client.Client({
  secret: token,
  // Adjust the endpoint if you are using Region Groups
  endpoint: "https://db.fauna.com/",
});

const queryResult = async (cb) => await client
.query(cb)
.then((ret) => {
  return {
    ...ret,
    success: true
  }
})
.catch((err) => {
  return {
    ...err,
    success: false
  }
});
export { queryResult, client, query };