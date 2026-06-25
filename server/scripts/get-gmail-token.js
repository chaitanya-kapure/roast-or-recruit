import { google } from "googleapis";
import readline from "readline";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(q) {
  return new Promise((r) => rl.question(q, r));
}

const SCOPES = ["https://www.googleapis.com/auth/gmail.send"];

console.log("\n=== Gmail API Token Generator ===\n");
console.log("Before running this, complete steps 1-5 from the Google Cloud setup.");
console.log("You need your CLIENT_ID and CLIENT_SECRET from the downloaded JSON.\n");

const CLIENT_ID = await ask("Paste your CLIENT_ID: ");
const CLIENT_SECRET = await ask("Paste your CLIENT_SECRET: ");
const GMAIL_USER = await ask("Your Gmail address: ");

const oauth2 = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, "urn:ietf:wg:oauth:2.0:oob");

const url = oauth2.generateAuthUrl({
  access_type: "offline",
  scope: SCOPES,
  prompt: "consent",
});

console.log("\n=== Step 1: Open this URL in your browser ===\n");
console.log(url);
console.log("\n=== Step 2: Sign in as", GMAIL_USER);
console.log('Click "Continue" → "Continue" → copy the code shown');
console.log("\n=== Step 3: Paste the code below ===\n");

const code = await ask("Enter code: ");

try {
  const { tokens } = await oauth2.getToken(code.trim());
  console.log("\n✅ Success! Add these to Railway:\n");
  console.log(`GMAIL_USER=${GMAIL_USER}`);
  console.log(`GMAIL_CLIENT_ID=${CLIENT_ID}`);
  console.log(`GMAIL_CLIENT_SECRET=${CLIENT_SECRET}`);
  console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`);
  console.log("");
} catch (err) {
  console.error("❌ Error:", err.message);
}

rl.close();
