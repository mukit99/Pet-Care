import Pet from '../models/Pet.js';
import { validateCreatePet, validateUpdatePet, validatePagination } from '../utils/validators.js';
import { sendSuccessResponse, sendErrorResponse, sendPaginatedResponse } from '../utils/errorResponse.js';
import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../config/constants.js';

export const getAllPets = async (req, res) => {
  try {
    const { error, value } = validatePagination(req.query);
    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { page, limit, sort, search } = value;
    const skip = (page - 1) * limit;

    // Build filter
    let filter = {};
    if (search) {
      filter = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { breed: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Get total count
    const total = await Pet.countDocuments(filter);

    // Get pets
    const pets = await Pet.find(filter)
      .populate('category', 'name slug')
      .populate('owner', 'firstName lastName profileImage')
      .sort(sort || { createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return sendPaginatedResponse(res, pets, { page, limit, total });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const createPet = async (req, res) => {
  try {
    const { error, value } = validateCreatePet(req.body);
    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.details[0].message
      });
    }

    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

    const pet = new Pet({
      ...value,
      owner: req.userId,
      images
    });

    await pet.save();
    await pet.populate('category');
    await pet.populate('owner', 'firstName lastName');

    return sendSuccessResponse(res, pet, SUCCESS_MESSAGES.RESOURCE_CREATED, HTTP_STATUS.CREATED);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const getPetById = async (req, res) => {
  try {
    const pet = await Pet.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('category')
      .populate('owner', 'firstName lastName profileImage phone email');

    if (!pet) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND
      });
    }

    return sendSuccessResponse(res, pet);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const updatePet = async (req, res) => {
  try {
    const { error, value } = validateUpdatePet(req.body);
    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.details[0].message
      });
    }

    let pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND
      });
    }

    // Check ownership
    if (pet.owner.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: ERROR_MESSAGES.FORBIDDEN
      });
    }

    // Update images if provided
    if (req.files && req.files.length > 0) {
      value.images = req.files.map(f => `/uploads/${f.filename}`);
    }

    pet = await Pet.findByIdAndUpdate(
      req.params.id,
      { ...value, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    return sendSuccessResponse(res, pet, SUCCESS_MESSAGES.RESOURCE_UPDATED);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND
      });
    }

    // Check ownership
    if (pet.owner.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: ERROR_MESSAGES.FORBIDDEN
      });
    }

    await Pet.findByIdAndDelete(req.params.id);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.RESOURCE_DELETED
    });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const getPetsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const total = await Pet.countDocuments({ category });
    const pets = await Pet.find({ category })
      .populate('category')
      .populate('owner', 'firstName lastName')
      .skip(skip)
      .limit(limit);

    return sendPaginatedResponse(res, pets, { page, limit, total });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const likePet = async (req, res) => {
  try {
    const pet = await Pet.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { likes: req.userId } },
      { new: true }
    );

    if (!pet) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND
      });
    }

    return sendSuccessResponse(res, pet, 'Pet liked');
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const unlikePet = async (req, res) => {
  try {
    const pet = await Pet.findByIdAndUpdate(
      req.params.id,
      { $pull: { likes: req.userId } },
      { new: true }
    );

    if (!pet) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND
      });
    }

    return sendSuccessResponse(res, pet, 'Pet unliked');
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const searchPets = async (req, res) => {
  try {
    const { query, category, location, minPrice, maxPrice, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { breed: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }

    if (category) filter.category = category;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }

    const total = await Pet.countDocuments(filter);
    const pets = await Pet.find(filter)
      .populate('category')
      .populate('owner', 'firstName lastName')
      .skip(skip)
      .limit(limit);

    return sendPaginatedResponse(res, pets, { page, limit, total });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};
