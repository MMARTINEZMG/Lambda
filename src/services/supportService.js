import AWS from "aws-sdk";

export class SupportService {
  constructor() {
    this.dynamoDB = new AWS.DynamoDB.DocumentClient();
    this.tableName = process.env.DYNAMODB_TABLE || "SupportTable";
    this.usersTable = process.env.USERS_TABLE || "UsersTable";
  }

  async create(support) {
    const params = {
      TableName: this.tableName,
      Item: support,
    };

    try {
      await this.dynamoDB.put(params).promise();
      return support;
    } catch (error) {
      console.error("Error al guardar en DynamoDB:", error);
      throw error;
    }
  }

  async findAll() {
    const params = {
      TableName: this.tableName,
    };

    try {
      const result = await this.dynamoDB.scan(params).promise();
      return result.Items || [];
    } catch (error) {
      console.error("Error al obtener registros de DynamoDB:", error);
      throw error;
    }
  }

  async findUserByEmail(email) {
    const params = {
      TableName: this.usersTable,
      Key: { email },
    };

    try {
      const result = await this.dynamoDB.get(params).promise();
      return result.Item || null;
    } catch (error) {
      console.error("Error al buscar usuario en DynamoDB:", error);
      throw error;
    }
  }
}
