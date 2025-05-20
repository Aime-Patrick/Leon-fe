/* eslint-disable */ 
import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { MdEmail } from "react-icons/md";
import { FaLock } from "react-icons/fa";
export const Login: React.FC = () => {
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string().required("Password is required"),
    }),
    onSubmit: (values) => {
      // Handle login logic here
      console.log("Login values:", values);
    },
  });
  return (
    <div className="p-5 w-full min-h-screen flex justify-center items-center bg-gray-200">
      <div className="w-full max-w-sm bg-white p-5 rounded shadow-md">
        <h1 className="text-2xl font-bold text-center mb-5">Login</h1>
        <form className="flex flex-col gap-4" onSubmit={formik.handleSubmit}>
          <div className="mb-4 relative">
            <label
              htmlFor="email"
              className="block text-[15px] font-medium text-gray-700"
            >
              Email
            </label>

            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                className={`mt-1 block w-full pr-2 py-3 pl-10 border ${
                  formik.touched.email && formik.errors.email
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded bg-[#f7f8fe]`}
                placeholder="Enter your email"
              />
              <MdEmail className="absolute top-1/2 left-3 transform -translate-y-1/2 text-blue-900 w-5 h-5" />
            </div>
            {formik.touched.email && formik.errors.email && (
              <div className="text-red-500 text-sm mt-1">
                {formik.errors.email}
              </div>
            )}
          </div>
          <div className="mb-4 relative">
            <label
              htmlFor="email"
              className="block text-[15px] font-medium text-gray-700"
            >
              Password
            </label>

            <div className="relative">
              <input
                type="password"
                id="password"
                name="password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
                className={`mt-1 block w-full pr-2 py-3 pl-10 border ${
                  formik.touched.password && formik.errors.password
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded bg-[#f7f8fe]`}
                placeholder="Enter your Password"
              />
              <FaLock className="absolute top-1/2 left-3 transform -translate-y-1/2 text-blue-900 w-5 h-5" />
            </div>
            {formik.touched.password && formik.errors.password && (
              <div className="text-red-500 text-sm mt-1">
                {formik.errors.password}
              </div>
            )}
          </div>
          <button
            type="submit"
            className="bg-blue-800 text-white p-2 py-3 rounded hover:bg-blue-900"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};
