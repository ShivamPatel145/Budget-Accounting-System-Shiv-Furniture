import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { contactService } from "../services/contact.service.js";

export const listContacts = asyncHandler(async (req, res) => {
  const contacts = await contactService.listContacts();
  res.json(new ApiResponse(200, contacts));
});

export const getContact = asyncHandler(async (req, res) => {
  const contact = await contactService.getContactById(req.params.id);
  res.json(new ApiResponse(200, contact));
});

export const createContact = asyncHandler(async (req, res) => {
  const contact = await contactService.createContact(req.body);
  res
    .status(201)
    .json(new ApiResponse(201, contact, "Contact created successfully"));
});

export const updateContact = asyncHandler(async (req, res) => {
  const contact = await contactService.updateContact(req.params.id, req.body);
  res.json(new ApiResponse(200, contact, "Contact updated successfully"));
});

export const deleteContact = asyncHandler(async (req, res) => {
  await contactService.deleteContact(req.params.id);
  res
    .status(200)
    .json(new ApiResponse(200, null, "Contact deleted successfully")); // 200 with message is often preferred over 204 for JSON APIs
});
