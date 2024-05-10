"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const dotenv = __importStar(require("dotenv"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
dotenv.config();
aws_sdk_1.default.config.update({
    region: process.env.REGION,
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    sessionToken: process.env.TOKEN
});
const poolData = {
    UserPoolId: process.env.USER_POOL_ID,
    ClientId: process.env.CLIENT_ID,
    PoolRegion: process.env.REGION
};
const handler = (event, context) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log(event.body);
        const credentials = JSON.parse(event.body);
        // Autenticar o usuário no Cognito
        const response = yield authenticateUser(credentials.username, credentials.password);
        // Verificar se a autenticação foi bem-sucedida
        if (!response) {
            throw new Error('Authentication failed');
        }
        const authResponse = response;
        const accessToken = (_a = authResponse.AuthenticationResult) === null || _a === void 0 ? void 0 : _a.AccessToken;
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': accessToken
            },
            body: JSON.stringify({
                "message": "Usuário autenticado com sucesso!"
            })
        };
    }
    catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 401,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Authentication failed' + event
            })
        };
    }
});
exports.handler = handler;
// Função para autenticar o usuário no Cognito
function authenticateUser(username, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const cognito = new aws_sdk_1.default.CognitoIdentityServiceProvider({ region: poolData.PoolRegion });
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
            }, function (err, response) {
                if (err) {
                    console.log("cognito nok");
                    reject(err);
                    throw new Error("Falha" + err);
                }
                console.log("cognito ok");
                resolve(response);
            });
        });
    });
}
