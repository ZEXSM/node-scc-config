
import express from "express";
import crypto from "crypto";

const app = express();

const cipherText = 'b165fc8cd067ae55136dea4ab478b5a1f157eba5df173c04e51b6982c06c682e';
const password = '12345678';

const DEFAULT_SALT = 'deadbeef';
const ALGORITHM_NAME = 'aes-256-cbc';
const DIGEST = 'sha1';
const ITERATIONS = 1024;
const KEY_LENGTH = 32;
const INITIAL_VECTOR = 16;

const createKey = (password: Buffer, salt: Buffer) =>
  crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST);

const aesDecrypt = (password: string, salt: string, data: string) => {
  const key = createKey(Buffer.from(password), Buffer.from(salt, 'hex'));
  const dataHex = Buffer.from(data, 'hex');
  const iv = dataHex.slice(0, INITIAL_VECTOR);
  const cipherHex = dataHex.slice(INITIAL_VECTOR, dataHex.length);

  const decipher = crypto.createDecipheriv(ALGORITHM_NAME, key, iv);
  const decrypted = Buffer.concat([decipher.update(cipherHex), decipher.final()]);

  return decrypted;
}

app.get("/", function (request, response) {
  response.send(`<h2>${aesDecrypt(password, DEFAULT_SALT, cipherText)}</h2>`);
});


app.listen(3000);