import { Handler } from 'aws-lambda';
import * as dotenv from "dotenv";
import AWS, { CognitoIdentityServiceProvider } from 'aws-sdk'

dotenv.config();

AWS.config.update({
    region: process.env.REGION,
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    sessionToken: process.env.TOKEN
})

interface CognitoJWT {
    iss: string;
    sub: string;
    token_use: string;
    exp: number;
    iat: number;
    username: string;
}

const poolData: { UserPoolId: string, ClientId: string, PoolRegion: string } = {
    UserPoolId: process.env.USER_POOL_ID as string,
    ClientId: process.env.CLIENT_ID as string,
    PoolRegion: process.env.REGION as string
}

interface credentials {
    username: string;
    password: string;
}


export const handler: Handler = async (event, context): Promise<any> => {
    try {
        console.log(event.body);
        const credentials = JSON.parse(event.body);

        // Autenticar o usuário no Cognito
        const response = await authenticateUser(credentials.username, credentials.password);

        // Verificar se a autenticação foi bem-sucedida
        if (!response) {
            throw new Error('Authentication failed');
        }
        const authResponse = response as CognitoIdentityServiceProvider.Types.AdminInitiateAuthResponse;
        const accessToken = authResponse.AuthenticationResult?.AccessToken;

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': accessToken
            },
            body: JSON.stringify({
                "message": "Usuário autenticado com sucesso"
            })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 401,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "message": "Não foi possivel autenticar"
            })
        };
    }
}

// Função para autenticar o usuário no Cognito
async function authenticateUser(username: string, password: string) {
    const cognito = new AWS.CognitoIdentityServiceProvider({ region: poolData.PoolRegion })

    console.log('cognito start');
    return new Promise((resolve, reject) => {
        cognito.adminInitiateAuth({
            AuthFlow: 'ADMIN_NO_SRP_AUTH',
            ClientId: poolData.ClientId,
            UserPoolId: poolData.UserPoolId,
            AuthParameters: {
                USERNAME: username,
                PASSWORD: password
            }
        }, function (err, response: CognitoIdentityServiceProvider.Types.AdminInitiateAuthResponse) {
            if (err) {
                console.log("cognito nok")
                reject(err)
                throw new Error("Falha" + err as string)
            }
            console.log("cognito ok")
            resolve(response)
        })
    })
}


