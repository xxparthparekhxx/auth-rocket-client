import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthConfig, UserCredentials, AuthResponse, VerifyResponse, User } from './types';
import { setItem, getItem, removeItem } from './utils/storage';
import { API_BASE_URL } from './constants/api';

class AuthLibrary {
  private axiosInstance: AxiosInstance;
  private clientId: string;
  private clientSecret: string;
  private userSubject: BehaviorSubject<User | null>;

  constructor(config: AuthConfig) {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
        "Client-ID": config.clientId,
        "Client-Secret": config.clientSecret,
      },
    });
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.userSubject = new BehaviorSubject<User | null>(null);
  }

  async register(credentials: UserCredentials): Promise<string> {
    try {
      const response = await this.axiosInstance.post<AuthResponse>(
        "/user/register/",
        {
          ...credentials,
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }
      );
      const token = response.data.token;
      await this.setUserFromToken(token);
      return token;
    } catch (error) {
      throw new Error("Registration failed: " + (error as Error).message);
    }
  }

  async login(credentials: UserCredentials): Promise<string> {
    try {
      const response = await this.axiosInstance.post<AuthResponse>(
        "/user/login/",
        {
          ...credentials,
          app_id: this.clientId,
        }
      );
      const token = response.data.token;
      await this.setUserFromToken(token);
      return token;
    } catch (error) {
      throw new Error("Login failed: " + (error as Error).message);
    }
  }

  async verifyToken(token: string): Promise<VerifyResponse> {
    try {
      const response = await this.axiosInstance.post<VerifyResponse>(
        "/user/verify-token/",
        { token }
      );
      this.userSubject.next(response.data);
      return response.data;
    } catch (error) {
      this.userSubject.next(null);
      throw new Error("Token verification failed: " + (error as Error).message);
    }
  }

  async deleteUser(userId: number): Promise<void> {
    try {
      await this.axiosInstance.delete(`/user/delete/${userId}/`);
      this.userSubject.next(null);
      removeItem("authToken");
    } catch (error) {
      throw new Error("User deletion failed: " + (error as Error).message);
    }
  }

  logout(): void {
    this.userSubject.next(null);
    removeItem("authToken");
  }

  getUser(): Observable<User | null> {
    return this.userSubject.asObservable();
  }

  async authenticatedRequest<T>(config: AxiosRequestConfig): Promise<T> {
    const user = this.userSubject.getValue();
    if (!user) {
      throw new Error("User is not authenticated");
    }
    try {
      const token = getItem("authToken");
      const response = await this.axiosInstance.request<T>({
        ...config,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        this.userSubject.next(null);
        removeItem("authToken");
      }
      throw error;
    }
  }

  private async setUserFromToken(token: string): Promise<void> {
    setItem("authToken", token);
    try {
      const userData = await this.verifyToken(token);
      this.userSubject.next(userData);
    } catch (error) {
      this.userSubject.next(null);
      removeItem("authToken");
    }
  }
  getUserSubject(): BehaviorSubject<User | null> {
    return this.userSubject;
  }
}

export default AuthLibrary;