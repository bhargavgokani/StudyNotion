import {Route, Routes, useNavigate } from "react-router-dom";
import Home from "./pages/home";
import "./App.css";
import OpenRoute from "./component/core/Auth/OpenRoute"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";
import VerifyEmail from "./pages/VerifyEmail";
import About from "./pages/About";
import Navbar from "./component/common/Navbar";
import MyProfile from "./component/core/Dashboard/MyProfile";
import Dashboard from "./pages/Dashboard";
import Error from "./pages/Error"
import PrivateRoute from "./component/core/Auth/PrivateRoute";
// import Settings from "./components/core/Dashboard/Settings";
import { useDispatch, useSelector } from "react-redux";
import { ACCOUNT_TYPE } from "./utils/constants";
// import Cart from "./components/core/Dashboard/Cart";
// import EnrolledCourses from "./components/core/Dashboard/EnrolledCourses";
// import Instructor from "./components/core/Dashboard/InstructorDashboard/Instructor";
// import AddCourse from "./components/core/Dashboard/AddCourse";
// import MyCourses from "./components/core/Dashboard/MyCourses";
// import EditCourse from "./components/core/Dashboard/EditCourse";


function App() {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.profile)

  return (
    <div className="w-screen min-h-screen bg-richblack-900 flex flex-col font-inter">
      <Navbar/>
      <Routes>
        <Route path="/" element = {<Home/>} />
        <Route
          path="signup"
          element={
            <OpenRoute>
              <Signup />
            </OpenRoute>
          }
          />
          <Route
            path="login"
            element={
              <OpenRoute>
                <Login />
              </OpenRoute>
            }
            />
        <Route
          path="forgot-password"
          element={
            <OpenRoute>
              <ForgotPassword />
            </OpenRoute>
          }
        />  

      <Route
          path="verify-email"
          element={
            <OpenRoute>
              <VerifyEmail />
            </OpenRoute>
          }
        />  

    <Route
          path="update-password/:id"
          element={
            <OpenRoute>
              <UpdatePassword />
            </OpenRoute>
          }
        />  

    <Route
          path="/about"
          element={
              <About />
          }
        />

    <Route 
      element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      }
    >
      <Route path="dashboard/my-profile" element={<MyProfile />} />
      
      {/* <Route path="dashboard/Settings" element={<Settings />} /> */}
      

      {
        user?.accountType === ACCOUNT_TYPE.STUDENT && (
          <>
          {/* <Route path="dashboard/cart" element={<Cart />} /> */}
          {/* <Route path="dashboard/enrolled-courses" element={<EnrolledCourses />} /> */}
          </>
        )
      }

      {
        user?.accountType === ACCOUNT_TYPE.INSTRUCTOR && (
          <>
          {/* <Route path="dashboard/instructor" element={<Instructor />} />
          <Route path="dashboard/add-course" element={<AddCourse />} />
          <Route path="dashboard/my-courses" element={<MyCourses />} />
          <Route path="dashboard/edit-course/:courseId" element={<EditCourse />} /> */}
          
          </>
        )
      }


      </Route>

      <Route path="*" element={<Error />} />

      </Routes>

    </div>
  );
}

export default App;
