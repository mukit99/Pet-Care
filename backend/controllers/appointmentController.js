import Appointment from '../models/Appointment.js';
import { validateCreateAppointment } from '../utils/validators.js';
import { sendSuccessResponse, sendErrorResponse, sendPaginatedResponse } from '../utils/errorResponse.js';
import { sendAppointmentConfirmation } from '../utils/emailService.js';
import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES, APPOINTMENT_STATUS } from '../config/constants.js';

export const createAppointment = async (req, res) => {
  try {
    const { error, value } = validateCreateAppointment(req.body);
    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.details[0].message
      });
    }

    const appointment = new Appointment({
      user: req.userId,
      vet: value.vetId,
      pet: value.petId,
      appointmentDate: value.appointmentDate,
      appointmentTime: value.appointmentTime,
      type: value.type,
      reason: value.reason
    });

    await appointment.save();
    await appointment.populate('vet');
    await appointment.populate('pet');

    return sendSuccessResponse(res, appointment, SUCCESS_MESSAGES.RESOURCE_CREATED, HTTP_STATUS.CREATED);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const getUserAppointments = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;

    let filter = { user: req.userId };
    if (status) filter.status = status;

    const total = await Appointment.countDocuments(filter);
    const appointments = await Appointment.find(filter)
      .populate('vet', 'clinicName phone')
      .populate('pet', 'name breed')
      .sort({ appointmentDate: -1 })
      .skip(skip)
      .limit(limit);

    return sendPaginatedResponse(res, appointments, { page, limit, total });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const getVetAppointments = async (req, res) => {
  try {
    const { vetId } = req.params;
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;

    let filter = { vet: vetId };
    if (status) filter.status = status;

    const total = await Appointment.countDocuments(filter);
    const appointments = await Appointment.find(filter)
      .populate('user', 'firstName lastName email phone')
      .populate('pet', 'name breed')
      .sort({ appointmentDate: -1 })
      .skip(skip)
      .limit(limit);

    return sendPaginatedResponse(res, appointments, { page, limit, total });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('user', 'firstName lastName email phone')
      .populate('vet', 'clinicName phone address')
      .populate('pet');

    if (!appointment) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND
      });
    }

    return sendSuccessResponse(res, appointment);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const updateAppointment = async (req, res) => {
  try {
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND
      });
    }

    // Check authorization
    if (appointment.user.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: ERROR_MESSAGES.FORBIDDEN
      });
    }

    appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    return sendSuccessResponse(res, appointment, SUCCESS_MESSAGES.RESOURCE_UPDATED);
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND
      });
    }

    // Check authorization
    if (appointment.user.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: ERROR_MESSAGES.FORBIDDEN
      });
    }

    appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        status: APPOINTMENT_STATUS.CANCELLED,
        updatedAt: new Date()
      },
      { new: true }
    );

    return sendSuccessResponse(res, appointment, 'Appointment cancelled');
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const confirmAppointment = async (req, res) => {
  try {
    let appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        status: APPOINTMENT_STATUS.CONFIRMED,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('user').populate('vet').populate('pet');

    if (!appointment) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND
      });
    }

    return sendSuccessResponse(res, appointment, 'Appointment confirmed');
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

export const completeAppointment = async (req, res) => {
  try {
    const { diagnosis, prescription, cost } = req.body;

    let appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        status: APPOINTMENT_STATUS.COMPLETED,
        diagnosis,
        prescription,
        cost,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!appointment) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND
      });
    }

    return sendSuccessResponse(res, appointment, 'Appointment completed');
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};
