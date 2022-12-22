import app, { init } from "@/app";
import httpStatus from "http-status";
import supertest from "supertest";
import { cleanDb, generateValidToken } from "../helpers";
import faker from "@faker-js/faker";
import * as jwt from "jsonwebtoken";
import { TicketStatus } from "@prisma/client";
import {
  createEnrollmentWithAddress,
  createUser,
  createTicketType,
  createTicket,
  createPayment,
  generateCreditCardData,
  createTicketTypeRemote,
  createHotel,
  createRoomWithHotelId,
  createBooking
} from "../factories";

beforeAll(async () => {
  await init();
});
  
beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /activities", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/activities");
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    
    const response = await server.get("/activities").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
    const response = await server.get("/activities").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });   
    
  describe("when token is valid", () => {
    it("should respond with status 406 when ticket is remote", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemote();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        
      const response = await server.get("/activities").set("Authorization", `Bearer ${token}`);
        
      expect(response.status).toEqual(httpStatus.NOT_ACCEPTABLE);
    });
  });
});
