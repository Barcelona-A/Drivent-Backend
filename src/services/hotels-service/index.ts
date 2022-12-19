import hotelRepository from "@/repositories/hotel-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { notFoundError } from "@/errors";
import { cannotListHotelsError, customerNotPayment } from "@/errors/cannot-list-hotels-error";
import { HotelProvider, RoomProvider } from "@/protocols";

async function listHotels(userId: number) {
  //Tem enrollment?
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }
  //Tem ticket pago isOnline false e includesHotel true
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  
  if (!ticket || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw cannotListHotelsError();
  }
  
  if (ticket.status === "RESERVED") {
    throw customerNotPayment();
  }
}

async function getHotels(userId: number) {
  //await listHotels(userId);
  const hotels: any = await hotelRepository.findHotels();
  
  hotels.forEach(async (hotel: HotelProvider) => {
    const rooms = hotel.Rooms;
    const roomsTypes: string[] = [];
    let hasSingle = false;
    let hasDouble = false;
    let hasTriple = false;
    let totalCapicty = 0;
    let totalBookings = 0;
    let availableVacancies = 0;
    
    rooms.filter(async (room: RoomProvider) => { //colocar um tipo
      totalCapicty += room.capacity;
      totalBookings += room.Booking.length;
      availableVacancies = totalCapicty - totalBookings;

      if (room.capacity === 1 && !hasSingle) {
        roomsTypes.push("Single");
        hasSingle = true;
      }
      if (room.capacity === 2 && !hasDouble) {
        roomsTypes.push("Double");
        hasDouble = true;
      }
      if (room.capacity > 2 && !hasTriple) {
        roomsTypes.push("Triple");
        hasTriple = true;
      }
    });
    delete hotel.Rooms;
    hotel.roomsTypes = roomsTypes;
    hotel.availableVacancies = availableVacancies;
  });
  
  return hotels as Omit<HotelProvider, "Rooms">[];
}

async function getHotelsWithRooms(userId: number, hotelId: number) {
  await listHotels(userId);
  const hotel = await hotelRepository.findRoomsByHotelId(hotelId);

  if (!hotel) {
    throw notFoundError();
  }
  return hotel;
}

const hotelService = {
  getHotels,
  getHotelsWithRooms,
};

export default hotelService;
