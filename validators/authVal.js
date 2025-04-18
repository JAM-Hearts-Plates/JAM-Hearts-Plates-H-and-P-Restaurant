import Joi from "joi";

export const registerUserValidator = Joi.object({
    firstName: Joi.string().regex(/^[A-Za-z]+$/).required(),
    lastName: Joi.string().regex(/^[A-Za-z]+$/).required(),
    userName: Joi.string().required(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    password: Joi.string().required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')),
    phone: Joi.string(),
    role: Joi.string().valid('user', 'manager', 'ceo', 'chef', 'waitstaff', 'finance').optional() //Role is optional, default to 'user' if not set/chosen/selected
}).with("password", "confirmPassword");


export const loginUserValidator = Joi.object({
    userName: Joi.string().optional(),
    email: Joi.string().optional(),
    password: Joi.string().required(),
});

export const updateUserValidator = Joi.object({
    firstName: Joi.string().regex(/^[A-Za-z]+$/).optional(),
    lastName: Joi.string().regex(/^[A-Za-z]+$/).optional(),
    email: Joi.string().optional(),
    password: Joi.string().optional(),
    phone: Joi.string().optional(),
    role: Joi.string().valid('user', 'manager', 'ceo', 'chef', 'waitstaff', 'finance').optional()
})

export const userIdValidator = Joi.object({
    id: Joi.string().required()
})

export const registerRiderValidator = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    password: Joi.string().required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')),
    role: Joi.string().valid('rider').optional(),
    vehicle: Joi.string().required(),
    phone: Joi.string().required(),
}).with("password", "confirmPassword");


export const loginRiderValidator = Joi.object({
    name: Joi.string().optional(),
    email: Joi.string().optional(),
    password: Joi.string().required(),
});

export const updateRiderValidator = Joi.object({
    name: Joi.string().optional(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).optional(),
    password: Joi.string().optional(),
    role: Joi.string().valid('rider').optional(),
    vehicle: Joi.string().optional(),
    phone: Joi.string().optional(),
})