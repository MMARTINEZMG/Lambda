import {createSupport, getSupports} from "./src/controllers/supportController.js";

export const handler = async (event) => {

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
    };

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: ''
        };
    }

    try {
        switch(event.requestContext.http.method) {
            case 'POST':
                const postResponse = await createSupport(event);
                return {
                    ...postResponse,
                    headers: {
                        ...postResponse.headers,
                        ...corsHeaders
                    }
                };
            case 'GET':
                const getResponse = await getSupports(event);
                return {
                    ...getResponse,
                    headers: {
                        ...getResponse.headers,
                        ...corsHeaders
                    }
                };
            default:
                return {
                    statusCode: 405,
                    headers: corsHeaders,
                    body: JSON.stringify({ message: 'Método no permitido' })
                };
        }
    } catch (error) {
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ message: 'Error interno del servidor' })
        };
    }
};