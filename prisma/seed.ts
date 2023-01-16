import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
const prisma = new PrismaClient();

async function main() {
  let event = await prisma.event.findFirst();
  let ticketTypes = await prisma.ticketType.findFirst();
  let hotels = await prisma.hotel.findFirst();
  let rooms = await prisma.room.findFirst();
  let local = await prisma.local.findFirst()
  let activities = await prisma.activity.findFirst();

  if (!event) {
    event = await prisma.event.create({
      data: {
        title: "Driven.t",
        logoImageUrl: "https://files.driveneducation.com.br/images/logo-rounded.png",
        backgroundImageUrl: "linear-gradient(to right, #FA4098, #FFD77F)",
        startsAt: dayjs().toDate(),
        endsAt: dayjs().add(21, "days").toDate(),
      },
    });
  }

  if (!ticketTypes) {
    await prisma.ticketType.create({
      data: {
        name: "Online",
        price: 10000,
        isRemote: true,
        includesHotel: false,
        updatedAt: dayjs().toDate(),
      },
    });
    await prisma.ticketType.create({
      data: {
        name: "Presencial",
        price: 25000,
        isRemote: false,
        includesHotel: false,
        updatedAt: dayjs().toDate(),
      },
    });
    await prisma.ticketType.create({
      data: {
        name: "Presencial com hotel",
        price: 60000,
        isRemote: false,
        includesHotel: true,
        updatedAt: dayjs().toDate(),
      },
    });
  }

  if (!hotels) {
    hotels = await prisma.hotel.create({
      data: {
        name: "Hotel Driven",
        image: "https://images.unsplash.com/photo-1517840901100-8179e982acb7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8aG90ZWx8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60",
        updatedAt: dayjs().toDate(),
      },
    });
  }

  if (!rooms) {
    await prisma.room.create({
      data: {
        name: "1001",
        capacity: 3,
        hotelId: hotels.id,
        updatedAt: dayjs().toDate(),
      },
    });
    await prisma.room.create({
      data: {
        name: "1002",
        capacity: 2,
        hotelId: hotels.id,
        updatedAt: dayjs().toDate(),
      },
    });
    await prisma.room.create({
      data: {
        name: "1003",
        capacity: 1,
        hotelId: hotels.id,
        updatedAt: dayjs().toDate(),
      },
    });
    await prisma.room.create({
      data: {
        name: "1004",
        capacity: 3,
        hotelId: hotels.id,
        updatedAt: dayjs().toDate(),
      },
    });
  }

  if (!local) {
    await prisma.local.create({
      data: {
        name: "Driven Park",
        updatedAt: dayjs().add(1, "hours").toDate(),
      },
    });
  }

  if (!activities && local) {
    await prisma.activity.create({
      data: {
        eventId: event.id,
        date: dayjs().toDate(),
        localId: local.id,
        name: "Atividade 1",
        startsAt: dayjs().toDate(),
        endsAt: dayjs().add(1, "hours").toDate(),
        duration: 1,
        capacity: 100,
        updatedAt: dayjs().toDate(),
      },
    });
    await prisma.activity.create({
      data: {
        eventId: event.id,
        date: dayjs().toDate(),
        localId: local.id,
        name: "Atividade 2",
        startsAt: dayjs().toDate(),
        endsAt: dayjs().add(2, "hours").toDate(),
        duration: 2,
        capacity: 100,
        updatedAt: dayjs().toDate(),
      },
    });
    await prisma.activity.create({
      data: {
        eventId: event.id,
        date: dayjs().add(1, "days").toDate(),
        localId: local.id,
        name: "Atividade 3",
        startsAt: dayjs().add(1, "days").toDate(),
        endsAt: dayjs().add(1, "days").add(1, "hours").toDate(),
        duration: 1,
        capacity: 1,
        updatedAt: dayjs().add(1, "days").toDate(),
      },
    });
    await prisma.activity.create({
      data: {
        eventId: event.id,
        date: dayjs().add(2, "days").toDate(),
        localId: local.id,
        name: "Atividade 4",
        startsAt: dayjs().add(2, "days").toDate(),
        endsAt: dayjs().add(2, "days").add(1, "hours").toDate(),
        duration: 1,
        capacity: 10,
        updatedAt: dayjs().add(2, "days").toDate(),
      },
    });
  }
  console.log({ event });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
