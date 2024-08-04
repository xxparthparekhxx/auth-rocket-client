export interface AuthConfig {
    clientId: string;
    clientSecret: string;
  }
  
  export interface UserCredentials {
    username: string;
    password: string;
  }
  
  export interface AuthResponse {
    token: string;
  }
  
  export interface VerifyResponse {
    username: string;
    app: string;
  }
  
  export interface User {
    id?:number
    username: string;
    app: string;
  }