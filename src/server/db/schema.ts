// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations } from "drizzle-orm";
import {
  index,
  pgTableCreator,
  timestamp,
  varchar,
  text,
  boolean,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator(
  (name) => `presentation-foundation_${name}`,
);

export const file_types = pgEnum("file_types", [
  "logo",
  "cover",
  "presentation",
  "handout",
  "research",
]);

export const visibility_types = pgEnum("visibility_types", [
  "public",
  "private",
]);

export const files = createTable(
  "files",
  {
    id: integer("id").primaryKey().unique(),
    name: text("name").notNull(),
    type: file_types("type").notNull(),
    datatype: text("type").notNull(),
    size: integer().notNull(),
    key: varchar("key", { length: 48 }).notNull(),
    ufsUrl: text("ufs_url").notNull(),
    isLocked: boolean("is_locked").default(false),
    password: text("password"),

    presentationId: integer("presentation_id").notNull(),
    owner: varchar("owner", { length: 32 }).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      fileIdIdx: index("file_id_idx").on(table.id),
      filePresentationIdIdx: index("file_presentation_id_idx").on(
        table.presentationId,
      ),
      fileOwnerIdx: index("file_owner_idx").on(table.owner),
      fileTypePresentationIdIdx: index("file_type_presentation_id_idx").on(
        table.type,
        table.presentationId,
      ),
    };
  },
);

export const presentations = createTable(
  "presentations",
  {
    id: integer("id").primaryKey().unique(),
    shortname: varchar("shortname", { length: 25 }).notNull().unique(),
    title: text("title").notNull(),
    description: text("description"),

    logo: integer("logo").references(() => files.id),
    cover: integer("cover").references(() => files.id),
    presentation: integer("presentation").references(() => files.id),
    handout: integer("handout").references(() => files.id),
    research: integer("research").references(() => files.id),

    kahootPin: text("kahoot_pin"),
    kahootSelfHostUrl: text("kahoot_self_host_url"),

    credits: text("credits"),

    visibility: visibility_types("visibility").default("private").notNull(),

    owner: varchar("owner", { length: 32 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      prIdIdx: index("pr_id_idx").on(table.id),
      prShortnameIdx: index("pr_shortname_idx").on(table.shortname),
      prOwnerIdx: index("pr_owner_idx").on(table.owner),
      prOwnerVisibilityIdx: index("pr_owner_visibility_idx").on(
        table.owner,
        table.visibility,
      ),
      prVisibilityIdx: index("pr_visibility_idx").on(table.visibility),
    };
  },
);

// Add foreign key constraints
export const presentationRelations = relations(
  presentations,
  ({ many, one }) => ({
    files: many(files),
    logoFile: one(files, {
      fields: [presentations.logo],
      references: [files.id],
    }),
    coverFile: one(files, {
      fields: [presentations.cover],
      references: [files.id],
    }),
    presentationFile: one(files, {
      fields: [presentations.presentation],
      references: [files.id],
    }),
    handoutFile: one(files, {
      fields: [presentations.handout],
      references: [files.id],
    }),
    researchFile: one(files, {
      fields: [presentations.research],
      references: [files.id],
    }),
  }),
);

export const fileRelations = relations(files, ({ one }) => ({
  presentation: one(presentations, {
    fields: [files.presentationId],
    references: [presentations.id],
  }),
}));
