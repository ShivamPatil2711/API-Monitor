import { useState } from 'react'
import { AuthProvider } from './context/AuthContext'
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AddEndpoint from './components/AddEndpoint';
import ProtectedRoute from './components/ProtectedRoute';
import EndpointList from './components/EndpointList';
function App() {
    const router = createBrowserRouter([
          {
      path: "/",
      element: <Layout />,
      children: [
        { index: true, element: <Home /> }, // Public route
        {path: "/login", element: <Login />},
        {path:"/register", element: <Register />},
        {
          path: "/add-endpoints",
          element:<ProtectedRoute><AddEndpoint/></ProtectedRoute>, // Protected route
        },
        {
          path: "/endpoints",
          element:<ProtectedRoute><EndpointList/></ProtectedRoute>, // Protected route
        }
         
   //      { path: "/signup", element: <Signup /> }, // Public route
     //   { path: "/login-page", element: <LoginPage /> }, // Public route
      ],
    },
   // { path: "*", element: <ErrorPage /> },
  ]);
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App
