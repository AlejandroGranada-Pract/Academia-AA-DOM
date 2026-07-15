import { test } from "node:test";
import assert from "node:assert";
import { SignJWT } from "jose";
import { verificarTokenSso } from "./sso-token";

process.env.SSO_SECRET = "secreto-test";
const clave = new TextEncoder().encode("secreto-test");
const otraClave = new TextEncoder().encode("otro-secreto");

function tokenValido() {
  return new SignJWT({ email: "Ana@Ambienteazul.com.co", nombre: "Ana" })
    .setProtectedHeader({ alg: "HS256" })
    .setAudience("academia")
    .setJti("jti-1")
    .setIssuedAt()
    .setExpirationTime("60s");
}

test("acepta un token válido y normaliza el email a minúsculas", async () => {
  const payload = await verificarTokenSso(await tokenValido().sign(clave));
  assert.strictEqual(payload?.email, "ana@ambienteazul.com.co");
  assert.strictEqual(payload?.nombre, "Ana");
  assert.strictEqual(payload?.jti, "jti-1");
});

test("rechaza firma con otro secreto", async () => {
  assert.strictEqual(await verificarTokenSso(await tokenValido().sign(otraClave)), null);
});

test("rechaza audiencia distinta", async () => {
  const token = await new SignJWT({ email: "a@b.co", nombre: "A" })
    .setProtectedHeader({ alg: "HS256" })
    .setAudience("otra-app")
    .setJti("x")
    .setExpirationTime("60s")
    .sign(clave);
  assert.strictEqual(await verificarTokenSso(token), null);
});

test("rechaza token vencido", async () => {
  const token = await new SignJWT({ email: "a@b.co", nombre: "A" })
    .setProtectedHeader({ alg: "HS256" })
    .setAudience("academia")
    .setJti("x")
    .setExpirationTime(Math.floor(Date.now() / 1000) - 10)
    .sign(clave);
  assert.strictEqual(await verificarTokenSso(token), null);
});

test("rechaza token sin email o sin jti", async () => {
  const token = await new SignJWT({ nombre: "A" })
    .setProtectedHeader({ alg: "HS256" })
    .setAudience("academia")
    .setExpirationTime("60s")
    .sign(clave);
  assert.strictEqual(await verificarTokenSso(token), null);
});

test("rechaza basura que no es JWT", async () => {
  assert.strictEqual(await verificarTokenSso("no-soy-un-token"), null);
});
