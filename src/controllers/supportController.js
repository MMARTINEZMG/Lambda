import {Support} from "../models/supportModel.js";
import {SupportService} from "../services/dynamoService.js";

const supportService = new SupportService();

export const createSupport = async (event) => {
    try {
        const data = JSON.parse(event.body);
        const support = new Support(data);
        support.validate();

        const savedSupport = await supportService.create(support);

        return {
            statusCode: 201,
            body: JSON.stringify(savedSupport)
        };
    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: error.message || 'Error al crear soporte'
            })
        };
    }
};

export const getSupports = async () => {
    try {
        const supports = await supportService.findAll();

        return {
            statusCode: 200,
            body: JSON.stringify(supports)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error al obtener soportes'
            })
        };
    }
};