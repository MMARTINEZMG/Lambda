import { Support } from "../models/supportModel.js";
import { SupportService } from "../services/supportService.js";

const supportService = new SupportService();

export const createSupport = async (event) => {
  try {
    const data = JSON.parse(event.body);
    const support = new Support(data);
    support.validate();

    const savedSupport = await supportService.create(support);

    return {
      statusCode: 201,
      body: JSON.stringify(savedSupport),
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: error.message || "Error al crear soporte",
      }),
    };
  }
};

export const getSupports = async () => {
  try {
    const supports = await supportService.findAll();

    return {
      statusCode: 200,
      body: JSON.stringify(supports),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error al obtener soportes",
      }),
    };
  }
};

export const login = async (event) => {
  try {
    const { email, password } = JSON.parse(event.body);

    if (!email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Email y contraseña son requeridos" }),
      };
    }

    const user = await supportService.findUserByEmail(email);

    if (!user || user.password !== password) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Credenciales inválidas" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Inicio de sesión exitoso",
        user: { email: user.email, name: user.name },
      }),
    };
  } catch (error) {
    console.error("Error durante el inicio de sesión:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error interno del servidor" }),
    };
  }
};
