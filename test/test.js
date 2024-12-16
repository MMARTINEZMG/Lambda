import { handler } from "../index.js";
import { SupportService } from "../src/services/supportService.js";
import AWSMock from "aws-sdk-mock";
import AWS from "aws-sdk";

// Configura mocks de AWS y variables de entorno
AWSMock.setSDKInstance(AWS);

process.env.DYNAMODB_TABLE = "SupportTable";
process.env.USERS_TABLE = "UsersTable";

describe("Lambda Handler", () => {
  let mockFindAll, mockCreate, mockFindUserByEmail;

  beforeAll(() => {
    // Mock de métodos del servicio
    mockFindAll = jest
      .spyOn(SupportService.prototype, "findAll")
      .mockResolvedValue([
        {
          name: "name",
          email: "Seguro?",
          description: "Lorem ipsum",
          type: "High",
          phone: "3112409618",
          priorityLevel: "High",
        },
      ]);

    mockCreate = jest
      .spyOn(SupportService.prototype, "create")
      .mockResolvedValue({
        name: "name",
        email: "Seguro?",
        description: "Lorem ipsum",
        type: "High",
        phone: "3112409618",
        priorityLevel: "High",
      });

    mockFindUserByEmail = jest
      .spyOn(SupportService.prototype, "findUserByEmail")
      .mockResolvedValue({
        email: "user@test.com",
        password: "1234",
      });

    AWSMock.mock("DynamoDB.DocumentClient", "scan", (params, callback) => {
      callback(null, { Items: [{ id: "1", name: "Soporte 1" }] });
    });

    AWSMock.mock("DynamoDB.DocumentClient", "put", (params, callback) => {
      callback(null, { Attributes: params.Item });
    });

    AWSMock.mock("DynamoDB.DocumentClient", "get", (params, callback) => {
      if (params.Key.email === "user@test.com") {
        callback(null, {
          Item: { email: "user@test.com", password: "1234", name: "Test User" },
        });
      } else {
        callback(null, {});
      }
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
    AWSMock.restore();
  });

  it("debería manejar una solicitud OPTIONS", async () => {
    const event = {
      httpMethod: "OPTIONS",
    };

    const result = await handler(event);
    expect(result.statusCode).toBe(200);
    expect(result.headers["Access-Control-Allow-Origin"]).toBe("*");
  });

  it("debería manejar una solicitud POST para crear soporte", async () => {
    const event = {
      httpMethod: "POST",
      rawPath: "/",
      body: JSON.stringify({
        name: "name",
        email: "Seguro?",
        description: "Lorem ipsum",
        type: "High",
        phone: "3112409618",
        priorityLevel: "High",
      }),
    };

    const result = await handler(event);
    expect(result.statusCode).toBe(201);
    const body = JSON.parse(result.body);
    expect(body.name).toBe("name");
  });

  it("debería manejar una solicitud GET para obtener soportes", async () => {
    const event = {
      httpMethod: "GET",
      rawPath: "/",
    };

    const result = await handler(event);
    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.length).toBeGreaterThan(0);
    expect(body[0].name).toBe("name");
  });

  it("debería manejar una solicitud POST para login exitoso", async () => {
    const event = {
      httpMethod: "POST",
      rawPath: "/login",
      body: JSON.stringify({ email: "user@test.com", password: "1234" }),
    };

    const result = await handler(event);
    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.message).toBe("Inicio de sesión exitoso");
  });

  it("debería manejar una solicitud POST para login con credenciales inválidas", async () => {
    mockFindUserByEmail.mockResolvedValueOnce(null);

    const event = {
      httpMethod: "POST",
      rawPath: "/login",
      body: JSON.stringify({ email: "wrong@test.com", password: "1234" }),
    };

    const result = await handler(event);
    expect(result.statusCode).toBe(401);
    const body = JSON.parse(result.body);
    expect(body.message).toBe("Credenciales inválidas");
  });

  it("debería devolver 405 para métodos no permitidos", async () => {
    const event = {
      httpMethod: "PUT",
    };

    const result = await handler(event);
    expect(result.statusCode).toBe(405);
    const body = JSON.parse(result.body);
    expect(body.message).toBe("Método no permitido");
  });

  it("debería manejar errores internos del servidor", async () => {
    mockFindAll.mockRejectedValueOnce(new Error("DynamoDB Error"));

    const event = {
      httpMethod: "GET",
      rawPath: "/supports",
    };

    const result = await handler(event);
    expect(result.statusCode).toBe(500);
    const body = JSON.parse(result.body);
    expect(body.message).toBe("Error al obtener soportes");
  });
});
