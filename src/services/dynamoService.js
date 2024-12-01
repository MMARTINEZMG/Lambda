import AWS from 'aws-sdk';

export class SupportService {
    constructor() {
        this.dynamoDB = new AWS.DynamoDB.DocumentClient();
        this.tableName = process.env.DYNAMODB_TABLE || 'SupportTable';
    }

    async create(support) {
        const params = {
            TableName: this.tableName,
            Item: support
        };

        try {
            await this.dynamoDB.put(params).promise();
            return support;
        } catch (error) {
            console.error('Error al guardar en DynamoDB:', error);
            throw error;
        }
    }

    async findAll() {
        const params = {
            TableName: this.tableName
        };

        try {
            const result = await this.dynamoDB.scan(params).promise();
            return result.Items || [];
        } catch (error) {
            console.error('Error al obtener registros de DynamoDB:', error);
            throw error;
        }
    }
}