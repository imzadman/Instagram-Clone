import { Account, Client, Databases, Query } from "appwrite";
import { conf } from "../conf/conf";

export class ProfileService {
  client = new Client();
  databases;
  account;
  constructor() {
    this.client
      .setEndpoint(conf.appwriteUrl)
      .setProject(conf.appwriteProjectId);
    this.databases = new Databases(this.client);
    this.account = new Account(this.client);
  }
  async createUserProfile({
    userName,
    profilePic,
    bio,
    gender,
    status,
    userId,
    followers,
  }) {
    try {
      const user = await this.account.get();
      return await this.databases.createDocument(
        conf.appwriteDbId,
        conf.appwriteCollectionId2,
        user.$id,
        {
          userName,
          profilePic,
          bio,
          gender,
          status,
          userId,
          followers,
        }
      );
    } catch (error) {
      console.log(
        "getUsersService :: createUserProfile :: error",
        error.message
      );
      throw new Error(
        error.message || "Failed to create profile. Please try again"
      );
    }
  }
  async getUserProfile(userId) {
    try {
      // const user = await this.account.get();
      return await this.databases.getDocument(
        conf.appwriteDbId,
        conf.appwriteCollectionId2,
        // user.$id
        userId
      );
    } catch (error) {
      console.log("getUsersService :: getUserProfile :: error", error);
      throw new Error(
        error.message || "Failed to get profile. Please try again"
      );
    }
  }
  async getUsersProfile(search) {
    try {
      let queries = [];
      if (search) {
        queries.push(Query.search("userName", search));
      }

      return await this.databases.listDocuments(
        conf.appwriteDbId,
        conf.appwriteCollectionId2,
        queries
        // [Query.equal("status", "public")]
      );
    } catch (error) {
      console.log("getUsersService :: getUsersProfile :: error", error);
      throw new Error(
        error.message || "Failed to retrieve all profiles. Please try again"
      );
    }
  }
  async updateUserProfile({
    userName,
    profilePic,
    bio,
    gender,
    status,
    userId,
    followers,
  }) {
    try {
      const user = await this.account.get();
      return await this.databases.updateDocument(
        conf.appwriteDbId,
        conf.appwriteCollectionId2,
        user.$id,
        {
          userName,
          profilePic,
          bio,
          gender,
          status,
          userId,
          followers,
        }
      );
    } catch (error) {
      console.log("getUsersService :: updateUserProfile :: error", error);
      throw new Error(
        error.message || "Failed to update profile. Please try again"
      );
    }
  }
  async deleteUserProfile() {
    try {
      const user = await this.account.get();
      await this.databases.deleteDocument(
        conf.appwriteDbId,
        conf.appwriteCollectionId2,
        user.$id
      );
      return true;
    } catch (error) {
      console.log(error);
      throw new Error(error.message || "Failed to delete profile");
    }
  }
  async addFollower(userId, followerId) {
    try {
      const userProfile = await this.getUserProfile(userId);
      const followers = userProfile.followers || [];
      if (!followers.includes(followerId)) {
        const updatedFollowers = [...followers, followerId];
        return await this.databases.updateDocument(
          conf.appwriteDbId,
          conf.appwriteCollectionId2,
          userId,
          { followers: updatedFollowers }
        );
      } else {
        return userProfile;
      }
    } catch (error) {
      console.log("ProfileService :: addFollower :: error", error.message);
      throw new Error(
        error.message || "Failed to add follower. Please try again"
      );
    }
  }
  async deleteFollower(userId, followerId) {
    try {
      const userProfile = await this.getUserProfile(userId);
      const updatedFollower = userProfile.followers
        ? userProfile.followers.filter((follower) => follower !== followerId)
        : [];
      return await this.databases.updateDocument(
        conf.appwriteDbId,
        conf.appwriteCollectionId2,
        userId,
        { followers: updatedFollower }
      );
    } catch (error) {
      console.log("ProfileService :: deleteFollower :: error", error.message);
      throw new Error(
        error.message || "Failed to delete follower. Please try again"
      );
    }
  }
  async getFollowers(userId) {
    try {
      const userProfile = await this.getUserProfile(userId);
      return userProfile.followers || [];
    } catch (error) {
      console.log("ProfileService :: getFollowers :: error", error.message);
      throw new Error(
        error.message || "Failed to get followers. Please try again"
      );
    }
  }
  async getFollowing(userId) {
    try {
      const profiles = await this.databases.listDocuments(
        conf.appwriteDbId,
        conf.appwriteCollectionId2,
        [Query.search("followers", userId)]
      );
      return profiles.documents.map((profile) => profile.$id);
    } catch (error) {
      console.log("ProfileService :: getFollowing :: error", error.message);
      throw new Error(
        error.message || "Failed to get Following. Please try again"
      );
    }
  }
  async isFollowing(userId, followerId) {
    try {
      const userProfile = await this.getUserProfile(userId);
      return userProfile.followers
        ? userProfile.followers.includes(followerId)
        : false;
    } catch (error) {
      console.log("ProfileService :: isFollowing :: error", error.message);
      throw new Error(
        error.message || "Failed to check following status. Please try again"
      );
    }
  }
  async getFollowCount(userId) {
    try {
      const followers = await this.getFollowers(userId);
      const following = await this.getFollowing(userId);
      return {
        followersCount: followers.length,
        followingCount: following.length,
      };
    } catch (error) {
      console.log("ProfileService :: getFollowCount :: error", error.message);
      throw new Error(
        error.message || "Failed to get follow count. Please try again"
      );
    }
  }
}

export const profileService = new ProfileService();
