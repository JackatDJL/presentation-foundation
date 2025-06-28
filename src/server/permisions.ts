import { createAccessControl } from "better-auth/plugins/access";
import {
  defaultStatements,
  adminAc,
  userAc,
} from "better-auth/plugins/admin/access";

const statement = {
  ...defaultStatements,
  presentation: [
    "create",
    "update",
    "delete",
    "update-global",
    "delete-global",
  ],
  orgs: [
    "create",
    "invite",
    "manage",
    "delete",
    "manage-global",
    "delete-global",
  ],
  tier: ["free", "pro"],
} as const;

export const ac = createAccessControl(statement);

export const user = ac.newRole({
  ...userAc.statements,
  presentation: ["create", "update", "delete"],
  orgs: ["create", "manage", "delete"],
  tier: ["free"],
});

export const proUser = ac.newRole({
  ...userAc.statements,
  presentation: ["create", "update", "delete"],
  orgs: ["create", "manage", "delete"],
  tier: ["pro"],
});

export const admin = ac.newRole({
  ...adminAc.statements,
  presentation: [
    "create",
    "update",
    "delete",
    "update-global",
    "delete-global",
  ],
  orgs: [
    "create",
    "invite",
    "manage",
    "delete",
    "manage-global",
    "delete-global",
  ],
  tier: ["pro"],
});
