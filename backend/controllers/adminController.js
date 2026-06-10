import User from '../models/User.js';
import Pet from '../models/Pet.js';
import Article from '../models/Article.js';
import Appointment from '../models/Appointment.js';
import AdoptionRequest from '../models/AdoptionRequest.js';
import { sendSuccessResponse, sendErrorResponse } from '../utils/errorResponse.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPets = await Pet.countDocuments();
    const totalArticles = await Article.countDocuments({ isPublished: true });
    const totalAppointments = await Appointment.countDocuments();
    const totalAdoptionRequests = await AdoptionRequest.countDocuments();
    const adoptedPets = await Pet.countDocuments({ adoptionStatus: 'adopted' });

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName email createdAt');

    const recentPets = await Pet.find()
      .populate('owner', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);

    const stats = {
      users: totalUsers,
      pets: totalPets,
      articles: totalArticles,
      appointments: totalAppointments,
      adoptionRequests: totalAdoptionRequests,
      adoptedPets,
      recentUsers,
      recentPets
    };

    return sendSuccessResponse(res, stats, 'Dashboard stats retrieved');
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};

    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Role is required'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND
      });
    }

    return sendSuccessResponse(res, user, 'User role updated');
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND
      });
    }

    // Delete user's pets and related data
    await Pet.deleteMany({ owner: req.params.id });

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const getAllPets = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (status) filter.adoptionStatus = status;

    const total = await Pet.countDocuments(filter);
    const pets = await Pet.find(filter)
      .populate('owner', 'firstName lastName email')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: pets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const deletePet = async (req, res) => {
  try {
    const pet = await Pet.findByIdAndDelete(req.params.id);

    if (!pet) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND
      });
    }

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Pet deleted successfully'
    });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const getAllArticles = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (status) filter.status = status;

    const total = await Article.countDocuments(filter);
    const articles = await Article.find(filter)
      .populate('author', 'firstName lastName email')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: articles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);

    if (!article) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND
      });
    }

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const getAdoptionRequests = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (status) filter.status = status;

    const total = await AdoptionRequest.countDocuments(filter);
    const requests = await AdoptionRequest.find(filter)
      .populate('pet', 'name breed images')
      .populate('requester', 'firstName lastName email')
      .populate('petOwner', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: requests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const getSystemSettings = async (req, res) => {
  try {
    // This would typically come from a Settings collection
    const settings = {
      siteName: 'Pet Care',
      tagline: 'Your Pet Care Companion',
      description: 'Comprehensive pet care platform for pet lovers',
      maintenanceMode: false,
      registrationEnabled: true
    };

    return sendSuccessResponse(res, settings);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const updateSystemSettings = async (req, res) => {
  try {
    // This would typically update a Settings collection
    const updatedSettings = req.body;

    return sendSuccessResponse(res, updatedSettings, 'Settings updated');
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};
