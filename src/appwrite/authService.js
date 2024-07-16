import { Account, Client, ID } from "appwrite";
import { conf } from "../conf/conf";

export class AuthService {
  client = new Client();
  account;
  constructor() {
    this.client
      .setEndpoint(conf.appwriteUrl)
      .setProject(conf.appwriteProjectId);
    this.account = new Account(this.client);
  }
  async createAccount({ name, email, password }) {
    try {
      await this.account.create(ID.unique(), email, password, name);
      return this.login({ email, password });
    } catch (error) {
      console.log("authService :: createAccount :: error", error);
      throw new Error(error.message || "Signup failed. Please try again.");
    }
  }
  async login({ email, password }) {
    try {
      return await this.account.createEmailPasswordSession(email, password);
    } catch (error) {
      console.log("authService :: login :: error", error);
      throw new Error(error.message || "Login failed. Please try again.");
    }
  }
  async getUser() {
    try {
      return await this.account.get();
    } catch (error) {
      console.log("authService :: getUser :: error", error);
    }
    return null;
  }
  async logout() {
    try {
      await this.account.deleteSessions();
    } catch (error) {
      console.log("authService :: logout :: error", error);
    }
  }
}
export const authService = new AuthService();
