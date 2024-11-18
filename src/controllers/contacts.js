import fs from 'node:fs/promises';

import path from 'node:path';

import createHttpError from 'http-errors';
import {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} from '../services/contacts.js';
import { uploadToCloudinary } from '../utils/uploadToCloudinary.js';

export const getContactsController = async (req, res) => {
  const {
    page = 1,
    perPage = 4,
    sortBy = 'name',
    sortOrder = 'asc',
    type,
    isFavourite,
  } = req.query;

  const { _id: userId } = req.user;

  const filter = { userId };

  if (type !== undefined) {
    filter.contactType = type;
  }
  if (isFavourite !== undefined) {
    filter.isFavourite = isFavourite === 'true';
  }

  const { contacts, totalItems } = await getAllContacts(
    userId,
    filter,
    page,
    perPage,
    sortBy,
    sortOrder,
  );

  const totalPages = Math.ceil(totalItems / perPage);
  const hasPreviousPage = page > 1;
  const hasNextPage = page < totalPages;

  res.status(200).json({
    status: 200,
    message: 'Successfully found contacts!',
    data: {
      data: contacts,
      page: Number(page),
      perPage: Number(perPage),
      totalItems,
      totalPages,
      hasPreviousPage,
      hasNextPage,
    },
  });
};

export const getContactByIdController = async (req, res) => {
  const { contactId } = req.params;

  const contact = await getContactById(contactId, req.user._id);

  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }

  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};

export const createContactController = async (req, res) => {
  let photo = null;

  if (typeof req.file !== 'undefined') {
    if (process.env.ENABLE_CLOUDINARY === 'true') {
      const result = await uploadToCloudinary(req.file.path);
      await fs.unlink(req.file.path);

      photo = result.secure_url;
    }
  } else {
    await fs.rename(
      req.file.path,
      path.resolve('src', 'public/photos', req.file.filename),
    );

    photo = `http://localhost:3000/photos/${req.file.filename}`;
  }

  const newContact = await createContact({
    ...req.body,
    userId: req.user._id,
    photo,
  });

  res.status(201).json({
    status: 201,
    message: `Successfully created a contact!`,
    data: newContact,
  });
};



export const deleteContactController = async (req, res) => {
  const { contactId } = req.params;

  const result = await deleteContact(contactId, req.user._id);
  if (!result) {
    throw createHttpError(404, 'Contact not found');
  }
  res.status(204).json({
    status: 204,
    message: `Contact deleted successfully`,
  });
};