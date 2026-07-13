import test from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";

test("bcrypt hash and verify", async () => {
  const hash = await bcrypt.hash("secret123", 12);
  assert.equal(await bcrypt.compare("secret123", hash), true);
  assert.equal(await bcrypt.compare("wrong", hash), false);
});

test("rbac role priority sanity", () => {
  const roles = ["MEMBER", "ADMIN_BRANCH"];
  const priority = [
    "ADMIN_PUSAT",
    "ADMINISTRATOR",
    "ADMIN",
    "ADMIN_PROVINCE",
    "ADMIN_BRANCH",
    "ADMIN_DOJO",
    "MEMBER",
  ];
  const primary = priority.find((r) => roles.includes(r));
  assert.equal(primary, "ADMIN_BRANCH");
});
