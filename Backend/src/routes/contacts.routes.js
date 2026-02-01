import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.js";
import {
  listContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
} from "../controllers/contacts.controller.js";

const router = Router();

router.use(authenticate);

router.get("/contacts", authorize("ADMIN", "PORTAL"), listContacts);
router.get("/contacts/:id", authorize("ADMIN", "PORTAL"), getContact);

router.post("/contacts", authorize("ADMIN"), createContact);
router.put("/contacts/:id", authorize("ADMIN"), updateContact);
router.delete("/contacts/:id", authorize("ADMIN"), deleteContact);

export default router;
