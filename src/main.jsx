import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Provider } from "react-redux";
import { store } from "./store/store.js";
import { Signup, Login, AuthLayout, Post, Posts } from "./components/index.js";
import {
  Home,
  EditPost,
  EditProfile,
  Explore,
  Search,
  Profile,
  AddPost,
  MainProfile,
} from "./pages/index.js";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route
        path=""
        element={
          <AuthLayout authentication>
            <Home />
          </AuthLayout>
        }
      />
      <Route
        path="signup"
        element={
          <AuthLayout authentication={false}>
            <Signup />
          </AuthLayout>
        }
      />
      <Route
        path="login"
        element={
          <AuthLayout authentication={false}>
            <Login />
          </AuthLayout>
        }
      />
      <Route
        path="edit-post/:postId"
        element={
          <AuthLayout authentication>
            <EditPost />
          </AuthLayout>
        }
      />
      <Route
        path="edit-profile/:userId"
        element={
          <AuthLayout authentication>
            <EditProfile />
          </AuthLayout>
        }
      />
      <Route
        path="explore"
        element={
          <AuthLayout authentication>
            <Explore />
          </AuthLayout>
        }
      />
      <Route
        path="search"
        element={
          <AuthLayout authentication>
            <Search />
          </AuthLayout>
        }
      />
      <Route path="profile/:userId" element={<Profile />} />
      <Route path="main-profile" element={<MainProfile />} />
      <Route
        path="add-post"
        element={
          <AuthLayout authentication>
            <AddPost />
          </AuthLayout>
        }
      />
      <Route
        path="post/:postId"
        element={
          <AuthLayout authentication>
            <Post />
          </AuthLayout>
        }
      />
      <Route
        path="posts/:userId"
        element={
          <AuthLayout>
            <Posts />
          </AuthLayout>
        }
      />
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);
