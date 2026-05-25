import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });
import { PrismaClient } from "../app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const room1 = await prisma.room.create({ data: { name: "Grande Salle A" } });
  const room2 = await prisma.room.create({ data: { name: "Salle B" } });

  const speaker1 = await prisma.speaker.create({
    data: {
      fullName: "Marie Dupont",
      biography: "Experte en architecture cloud et DevOps.",
      links: { twitter: "https://twitter.com/marie" },
    },
  });

  const speaker2 = await prisma.speaker.create({
    data: {
      fullName: "Jean Martin",
      biography: "Développeur full-stack et conférencier.",
      links: { github: "https://github.com/jean" },
    },
  });

  const event = await prisma.event.create({
    data: {
      title: "Tech Conference 2026",
      description: "La conférence tech de l'année à ne pas manquer.",
      startDate: new Date("2026-06-15T09:00:00"),
      endDate: new Date("2026-06-15T18:00:00"),
      place: "Paris, France",
    },
  });

  const now = new Date();

  await prisma.session.create({
    data: {
      title: "Introduction au Cloud Native",
      description: "Tour d'horizon des architectures modernes.",
      startDate: new Date(now.getTime() - 30 * 60 * 1000),
      endDate: new Date(now.getTime() + 60 * 60 * 1000),
      capacity: 200,
      roomId: room1.id,
      eventId: event.id,
      speakers: { create: [{ speakerId: speaker1.id }] },
    },
  });

  await prisma.session.create({
    data: {
      title: "React 19 en pratique",
      description: "Les nouveautés de React 19 et comment les utiliser.",
      startDate: new Date("2026-06-15T11:00:00"),
      endDate: new Date("2026-06-15T12:00:00"),
      capacity: 150,
      roomId: room2.id,
      eventId: event.id,
      speakers: { create: [{ speakerId: speaker2.id }] },
    },
  });

  await prisma.session.create({
    data: {
      title: "DevOps et CI/CD",
      description: "Automatiser vos déploiements avec GitHub Actions.",
      startDate: new Date("2026-06-15T14:00:00"),
      endDate: new Date("2026-06-15T15:30:00"),
      capacity: 100,
      roomId: room1.id,
      eventId: event.id,
      speakers: {
        create: [{ speakerId: speaker1.id }, { speakerId: speaker2.id }],
      },
    },
  });

  console.log("Seed terminé avec succès !");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
