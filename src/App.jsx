import { Outlet, useNavigate } from "react-router-dom";
import { BottomNavbar, Header } from "./components/index";
import { authService } from "./appwrite/authService";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { login, logout } from "./store/authSlice";
import { Toaster } from "react-hot-toast";
import LoadingBar from "react-top-loading-bar";

function App() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    (async () => {
      await authService
        .getUser()
        .then((userData) => {
          if (userData) {
            dispatch(login(userData));
          } else {
            dispatch(logout());
          }
        })
        .finally(() => setLoading(false));
    })();
  }, [dispatch]);
  return loading ? null : (
    <div className="w-full h-full flex flex-col lg:flex-row">
      <LoadingBar
        color="red"
        progress={progress}
        onLoaderFinished={() => {
          setProgress(0);
        }}
      />
      <Toaster position="top-right" reverseOrder={false} />
      <Header />
      <Outlet context={{ setProgress }} />
      <BottomNavbar />
    </div>
  );
}

export default App;
