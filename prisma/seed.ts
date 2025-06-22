// import {
//   PrismaClient,
//   type file_types,
//   type fileStorage_types,
//   type fileTransfer_types,
//   type visibility_types,
// } from "@prisma/client";

// const prisma = new PrismaClient();

// type Presentation = {
//   id: string;
//   shortname: string;
//   title: string;
//   description?: string | null;
//   logo?: string | null;
//   cover?: string | null;
//   presentation?: string | null;
//   handout?: string | null;
//   research?: string | null;
//   kahoot_pin?: string | null;
//   kahoot_id?: string | null;
//   credits?: string | null;
//   visibility: string;
//   owner: string;
//   created_at: string;
//   updated_at: string;
// };

// type File = {
//   id: string;
//   name: string;
//   fileType: string;
//   dataType: string;
//   size: number;
//   ufs_key?: string | null;
//   url: string;
//   is_locked: boolean;
//   password?: string | null;
//   presentation_id: string;
//   owner: string;
//   created_at: string;
//   updated_at: string;
//   blob_path?: string | null;
//   stored_in: string;
//   target_storage: string;
//   transfer_status: string;
// };

// async function main() {
//   // Load JSON data
//   const presentations = [
//     // PASTE JSON DATA HERE
//   ] as Presentation[];
//   const files = [
//     // PASTE JSON DATA HERE
//   ] as File[];

//   // Seed files
//   for (const f of files) {
//     await prisma.files.upsert({
//       where: { id: f.id },
//       update: {},
//       create: {
//         id: f.id,
//         name: f.name,
//         fileType: f.fileType as file_types,
//         dataType: f.dataType,
//         size: f.size,
//         ufsKey: f.ufs_key ?? undefined,
//         blobPath: f.blob_path ?? undefined,
//         url: f.url,
//         storedIn: f.stored_in as fileStorage_types,
//         targetStorage: f.target_storage as fileStorage_types,
//         transferStatus: f.transfer_status.replace(
//           " ",
//           "_",
//         ) as fileTransfer_types,
//         isLocked: f.is_locked,
//         password: f.password ?? undefined,
//         presentationId: f.presentation_id,
//         owner: f.owner,
//         createdAt: new Date(f.created_at),
//         updatedAt: new Date(f.updated_at),
//       },
//     });
//   }

//   // Seed presentations
//   for (const p of presentations) {
//     await prisma.presentations.upsert({
//       where: { id: p.id },
//       update: {},
//       create: {
//         id: p.id,
//         shortname: p.shortname,
//         title: p.title,
//         description: p.description ?? undefined,
//         logo: p.logo ? { connect: { id: p.logo } } : undefined,
//         cover: p.cover ? { connect: { id: p.cover } } : undefined,
//         presentation: p.presentation
//           ? { connect: { id: p.presentation } }
//           : undefined,
//         handout: p.handout ? { connect: { id: p.handout } } : undefined,
//         research: p.research ? { connect: { id: p.research } } : undefined,
//         kahootPin: p.kahoot_pin ?? undefined,
//         kahootId: p.kahoot_id ?? undefined,
//         credits: p.credits ?? undefined,
//         visibility: p.visibility as visibility_types,
//         owner: p.owner,
//         createdAt: new Date(p.created_at),
//         updatedAt: new Date(p.updated_at),
//       },
//     });
//   }

//   console.log("Seeded presentations and files.");
// }

// main()
//   .then(async () => {
//     await prisma.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prisma.$disconnect();
//     process.exit(1);
//   });
