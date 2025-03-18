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
  uuid,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `${name}`);

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

export const fileStorage_types = pgEnum("fileStorage_types", [
  "utfs", // Uploadthing // utfs.io
  "blob", // Vercel Blob
  // Possibly s3 in the future
]);

export const fileTransfer_types = pgEnum("fileTransfer_types", [
  "idle",
  "queued",
  "in progress",
]);

export const files = createTable(
  "files",
  {
    id: uuid("id").primaryKey().defaultRandom().unique(),
    name: text("name").notNull(),
    fileType: file_types("fileType").notNull(),
    dataType: text("dataType").notNull(),
    size: integer().notNull(),

    ufsKey: varchar("ufs_key", { length: 48 }),
    blobPath: varchar("blob_path"),
    url: text("url").notNull(),

    storedIn: fileStorage_types("stored_in").notNull().default("utfs"),
    targetStorage: fileStorage_types("target_storage")
      .notNull()
      .default("blob"),
    transferStatus: fileTransfer_types("transfer_status")
      .notNull()
      .default("idle"),

    isLocked: boolean("is_locked").default(false),
    password: text("password"),

    presentationId: uuid("presentation_id").notNull(),
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
      fileTypePresentationIdIdx: index("fileType_presentation_id_idx").on(
        table.fileType,
        table.presentationId,
      ),
    };
  },
);

// TODO: Implement views
export const presentations = createTable(
  "presentations",
  {
    id: uuid("id").primaryKey().defaultRandom().unique(),
    shortname: varchar("shortname", { length: 25 }).notNull().unique(),
    title: text("title").notNull(),
    description: text("description"),

    logo: uuid("logo").references(() => files.id),
    cover: uuid("cover").references(() => files.id),
    presentation: uuid("presentation").references(() => files.id),
    handout: uuid("handout").references(() => files.id),
    research: uuid("research").references(() => files.id),

    kahootPin: text("kahoot_pin"),
    kahootId: text("kahoot_id"),

    credits: text("credits"),

    // visibility: varchar({ enum: ["public", "private"] })
    //   .default("private")
    //   .notNull(),
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
      prKahootPinIdx: index("pr_kahoot_pin_idx").on(table.kahootPin),
      prKahootIdIdx: index("pr_kahoot_id_idx").on(table.kahootId),
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
