// Import library dan dependencies yang dibutuhkan
import { Container } from "inversify";
import { TYPES } from "../infrastructure/entity/types";
import { PrismaClient } from "@prisma/client";
import { UserRepository } from "../infrastructure/db/userRepo";
import { SessionRepository } from "../infrastructure/db/sessionRepo";
import { NoteRepository } from "../infrastructure/db/noteRepo";
import { AuthServices } from "./services/authServices";
import { NoteServices } from "./services/noteServices";

// Membuat container inversify baru
const container = new Container();

// Mendaftarkan PrismaClient sebagai singleton
container.bind(TYPES.prisma).toConstantValue(new PrismaClient());

// Mendaftarkan repository ke container
container.bind(TYPES.userRepo).to(UserRepository); // Repository untuk user
container.bind(TYPES.sessionRepo).to(SessionRepository); // Repository untuk session
container.bind(TYPES.noteRepo).to(NoteRepository); // Repository untuk note

// Mendaftarkan services ke container
container.bind(AuthServices).toSelf(); // Service untuk autentikasi
container.bind(NoteServices).toSelf(); // Service untuk mengelola note

// Membuat instance services yang sudah diinjeksi dependensinya
export const authServices = container.get<AuthServices>(AuthServices); // Instance AuthServices
export const noteServices = container.get<NoteServices>(NoteServices); // Instance NoteServices
