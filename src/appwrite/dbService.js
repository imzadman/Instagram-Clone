import { Client, Databases, ID, Query } from "appwrite";
import { conf } from "../conf/conf";

export class DbService {
  client = new Client();
  databases;
  constructor() {
    this.client
      .setEndpoint(conf.appwriteUrl)
      .setProject(conf.appwriteProjectId);
    this.databases = new Databases(this.client);
  }
  async createPost({
    caption,
    featuredImage,
    status,
    userId,
    likes,
    comments,
    createdAt,
    updatedAt,
  }) {
    try {
      return await this.databases.createDocument(
        conf.appwriteDbId,
        conf.appwriteCollectionId1,
        ID.unique(),
        {
          caption,
          featuredImage,
          status,
          userId,
          likes,
          comments,
          createdAt,
          updatedAt,
        }
      );
    } catch (error) {
      console.log("dbService :: createPost :: error", error);
      throw new Error(error.message || "Failed to create post");
    }
  }
  async updatePost(
    postId,
    {
      caption,
      featuredImage,
      status,
      userId,
      likes,
      comments,
      createdAt,
      updatedAt,
    }
  ) {
    try {
      return await this.databases.updateDocument(
        conf.appwriteDbId,
        conf.appwriteCollectionId1,
        postId,
        {
          caption,
          featuredImage,
          status,
          userId,
          likes,
          comments,
          createdAt,
          updatedAt,
        }
      );
    } catch (error) {
      console.log("dbService :: updatePost :: error", error);
      throw new Error(error.message || "Failed to update post");
    }
  }
  async deletePost(postId) {
    try {
      await this.databases.deleteDocument(
        conf.appwriteDbId,
        conf.appwriteCollectionId1,
        postId
      );
      return true;
    } catch (error) {
      console.log("dbService :: deletePost :: error", error);
      throw new Error(error.message || "Failed to delete post");
    }
  }
  async getPost(postId) {
    try {
      return await this.databases.getDocument(
        conf.appwriteDbId,
        conf.appwriteCollectionId1,
        postId
      );
    } catch (error) {
      console.log("dbService :: getPost :: error", error);
      throw new Error(error.message || "Failed to retrieve post");
    }
  }
  async getPosts() {
    try {
      return await this.databases.listDocuments(
        conf.appwriteDbId,
        conf.appwriteCollectionId1,
        [Query.equal("status", "Public")]
      );
    } catch (error) {
      console.log("dbService :: getPosts :: error", error);
      throw new Error(error.message || "Failed to retrieve posts");
    }
  }
  async getUserPosts(userId) {
    let queries = [];
    // queries.push(Query.equal("status", "Public"));
    if (userId) {
      queries.push(Query.equal("userId", userId));
    }
    try {
      return await this.databases.listDocuments(
        conf.appwriteDbId,
        conf.appwriteCollectionId1,
        queries
      );
    } catch (error) {
      console.log("dbService :: getPosts :: error", error);
      throw new Error(error.message || "Failed to retrieve posts");
    }
  }
  async addComment(postId, userId, content, createdAt) {
    try {
      const post = await this.getPost(postId);
      const comments = post.comments || [];
      const newComment = JSON.stringify({
        id: ID.unique(),
        userId,
        content,
        createdAt,
      });
      comments.push(newComment);
      return await this.databases.updateDocument(
        conf.appwriteDbId,
        conf.appwriteCollectionId1,
        postId,
        { comments }
      );
    } catch (error) {
      console.log("dbService :: addComment :: error", error);
      throw new Error(error.message || "Failed to add comment");
    }
  }
  async getComments(postId) {
    try {
      const post = await this.getPost(postId);
      return post.comments
        ? post.comments.map((comment) => JSON.parse(comment))
        : [];
    } catch (error) {
      console.log("dbService :: getComments :: error", error);
      throw new Error(error.message || "Failed to get comments");
    }
  }
  async deleteComment(postId, commentId) {
    try {
      //get the current post
      const post = await this.getPost(postId);
      // Parse the comments array
      let comments = post.comments
        ? post.comments.map((comment) => JSON.parse(comment))
        : [];
      // Filtering the comment to be deleted
      comments = comments.filter((comment) => comment.id !== commentId);
      // Stringify the comments again
      const updatedComments = comments.map((comment) =>
        JSON.stringify(comment)
      );
      // Update the post with the new comments array
      return await this.databases.updateDocument(
        conf.appwriteDbId,
        conf.appwriteCollectionId1,
        postId,
        { comments: updatedComments }
      );
    } catch (error) {
      console.log("dbService :: deleteComment :: error", error);
      throw new Error(error.message || "Failed to delete comment");
    }
  }
  async addLike(postId, userId) {
    try {
      const post = await this.getPost(postId);
      const likes = post.likes || [];
      if (!likes.includes(userId)) {
        likes.push(userId);
        return await this.databases.updateDocument(
          conf.appwriteDbId,
          conf.appwriteCollectionId1,
          postId,
          { likes }
        );
      }
      return post;
    } catch (error) {
      console.log("dbService :: addLike :: error", error);
      throw new Error(error.message || "Failed to add like");
    }
  }
  async deleteLike(postId, userId) {
    const post = await this.getPost(postId);
    const likes = post.likes ? post.likes.filter((id) => id !== userId) : [];
    return await this.databases.updateDocument(
      conf.appwriteDbId,
      conf.appwriteCollectionId1,
      postId,
      { likes }
    );
  }
  async getLikes(postId) {
    try {
      const post = await this.getPost(postId);
      return post.likes ? post.likes : [];
    } catch (error) {
      console.log("dbService :: getLikes :: error", error);
      throw new Error(error.message || "Failed to get likes");
    }
  }
}
export const dbService = new DbService();
