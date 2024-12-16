import {
  createSupport,
  getSupports,
  login,
} from "./src/controllers/supportController.js";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET_KEY || "mysecretkey";

const verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    return null;
  }
};

export const handler = async (event) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
  };

  const token = event.headers.Authorization || event.headers.authorization;
  const tokenWithoutBearer = token ? token.split(" ")[1] : null;
  const user = tokenWithoutBearer ? verifyToken(tokenWithoutBearer) : null;

  if (event.requestContext.http.method === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: "",
    };
  }

  try {
    switch (event.requestContext.http.method) {
      case "POST":
        if (event.rawPath === "/login") {
          const loginResponse = await login(event);
          return {
            ...loginResponse,
            headers: {
              ...loginResponse.headers,
              ...corsHeaders,
            },
          };
        }
        const postResponse = await createSupport(event);
        return {
          ...postResponse,
          headers: {
            ...postResponse.headers,
            ...corsHeaders,
          },
        };
      case "GET":
        if (!user) {
          return {
            statusCode: 401,
            headers: corsHeaders,
            body: JSON.stringify({ message: "No autorizado" }),
          };
        }
        const getResponse = await getSupports(event);
        return {
          ...getResponse,
          headers: {
            ...getResponse.headers,
            ...corsHeaders,
          },
        };
      default:
        return {
          statusCode: 405,
          headers: corsHeaders,
          body: JSON.stringify({ message: "Método no permitido" }),
        };
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Error interno del servidor" }),
    };
  }
};
