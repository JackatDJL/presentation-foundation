// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations } from "drizzle-orm";
import {
  index,
  pgTableCreator,
  timestamp,
  varchar,
  serial,
  text,
  boolean,
  integer,
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

// Define tables without circular references first
export const files = createTable(
  "files",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    type: text("type").notNull(),
    url: text("url").notNull(),
    isLocked: boolean("is_locked").default(false),
    password: text("password"),
    // We'll add the foreign key later
    presentationId: integer("presentation_id"),
  },
  (table) => {
    return {
      presentationIdIdx: index("presentation_id_idx").on(table.presentationId),
      typeIdx: index("type_idx").on(table.type),
    };
  },
);

export const presentations = createTable(
  "presentations",
  {
    id: serial("id").primaryKey(),
    shortname: varchar("shortname", { length: 50 }).notNull().unique(),
    title: text("title").notNull(),
    description: text("description"),
    // Use integer instead of serial for foreign keys
    logo: serial("logo"),
    cover: serial("cover"),
    presentation: serial("presentation"),
    handout: serial("handout"),
    research: serial("research"),
    kahootPin: text("kahoot_pin"),
    kahootSelfHostUrl: text("kahoot_self_host_url"),
    visibility: text("visibility", { enum: ["public", "private"] })
      .notNull()
      .default("private"),
    owner: text("owner").notNull(),
    credits: text("credits"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      shortnameIdx: index("shortname_idx").on(table.shortname),
      ownerIdx: index("owner_idx").on(table.owner),
      visibilityIdx: index("visibility_idx").on(table.visibility),
    };
  },
);

// Add foreign key constraints
// This is a type-safe way to add foreign key references after table definitions
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
