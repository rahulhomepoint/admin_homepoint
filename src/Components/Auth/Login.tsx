import React, { useState, useEffect } from "react";
import logo from "../../../public/home_point_logo.svg";
import { Button, Label, TextInput } from "flowbite-react";
import { BsEyeFill } from "react-icons/bs";
import { GoEyeClosed } from "react-icons/go";
import bg from "../../../public/BG_Pattern_Fresh_new_launches.png";
import { useNavigate } from "react-router";
import {
  loginAPI,
  forgetPasswordRequest,
  resetPasswordOtp,
} from "../../API/Auth/Auth.api.js";
import { HiOutlineMail } from "react-icons/hi";
import { PiPasswordThin } from "react-icons/pi";
import { FcLock } from "react-icons/fc";

export default function Login() {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    newPassword: "",
    loading: false,
  });
  const [showPass, setshowPass] = useState(false);
  const [forget, setfroget] = useState(false);
  const [OTPRequest, setOTPRequest] = useState({
    value: false,
    OTP: "",
  });

  const navigation = useNavigate();

  // Check for existing token on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigation("/dashboard");
    }
  }, [navigation]);

  const SubmitLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginData({ ...loginData, loading: true });
    const response = await loginAPI(loginData.email, loginData.password);
    if (response.success == true) {
      navigation("/dashboard");
    } else {
      setLoginData({ ...loginData, loading: false });
    }
  };

  const forgetRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginData({ ...loginData, loading: true });
    const response = await forgetPasswordRequest(loginData.email);
    if (response.success == true) {
      console.log("this is the OTP response 1" + response.success);
      setOTPRequest({ ...OTPRequest, value: true });
    } else {
      console.log("this is the OTP response 2" + response.data);
      setOTPRequest({ ...OTPRequest, value: false });
    }
    setLoginData({ ...loginData, loading: false });
    console.log(OTPRequest);
  };

  const forgetSubmitPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoginData({ ...loginData, loading: true });
    const response = await resetPasswordOtp(
      loginData.email,
      OTPRequest.OTP,
      loginData.newPassword,
    );
    if (response.success == true) {
      setLoginData({ ...loginData, loading: false });
      navigation("/");
    } else {
      setLoginData({ ...loginData, loading: false });
    }
  };

  const handleSubmit = forget
    ? OTPRequest.value
      ? forgetSubmitPassword
      : forgetRequest
    : SubmitLogin;

  return (
    <section
      className="bg-gray-50 bg-cover bg-no-repeat dark:bg-gray-900"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="mx-auto flex flex-col items-center justify-center px-6 py-8 md:h-screen lg:py-0">
        <a
          href="#"
          className="mb-6 flex items-center text-2xl font-semibold text-gray-900 dark:text-white"
        >
          <img className="mr-2 h-14 w-96" src={logo} alt="logo" />
        </a>
        <div className="w-full rounded-lg border-1 border-gray-300 bg-white shadow-xl sm:max-w-md md:mt-0 xl:p-0 dark:border dark:border-gray-700 dark:bg-gray-800">
          <div className="space-y-4 p-6 sm:p-8 md:space-y-6">
            <h1 className="text-xl leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              {forget ? "Forget Password" : "Sign in to your account"}
            </h1>
            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Your email
                </label>
                <TextInput
                  type="email"
                  name="email"
                  id="email"
                  icon={HiOutlineMail}
                  placeholder="name@company.com"
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData({ ...loginData, email: e.target.value })
                  }
                />
              </div>
              {!forget ? (
                <>
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Password
                    </label>

                    <div className="relative">
                      <TextInput
                        type={showPass ? "text" : "password"}
                        value={loginData.password}
                        icon={FcLock}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            password: e.target.value,
                          })
                        }
                        placeholder="••••••••"
                      />
                      <span
                        className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3"
                        onClick={() => setshowPass(!showPass)}
                      >
                        {showPass ? <BsEyeFill /> : <GoEyeClosed />}
                      </span>
                    </div>
                  </div>
                </>
              ) : null}
              {OTPRequest.value ? (
                <>
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      New Password
                    </label>

                    <div className="relative">
                      <TextInput
                        type={showPass ? "text" : "password"}
                        value={loginData.newPassword}
                        icon={PiPasswordThin}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            newPassword: e.target.value,
                          })
                        }
                        placeholder="••••••••"
                      />
                      <span
                        className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3"
                        onClick={() => setshowPass(!showPass)}
                      >
                        {showPass ? <BsEyeFill /> : <GoEyeClosed />}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label>Enter the OTP sent to your email</Label>
                    <TextInput
                      type="number"
                      value={OTPRequest.OTP}
                      minLength={6}
                      maxLength={6}
                      onChange={(e) =>
                        setOTPRequest({
                          ...OTPRequest,
                          OTP: e.target.value,
                        })
                      }
                    />
                  </div>
                </>
              ) : null}
              <div className="flex items-center justify-between">
                <div className="flex items-start">
                  <div className="flex h-5 items-center">
                    <input
                      id="remember"
                      aria-describedby="remember"
                      type="checkbox"
                      className="focus:ring-primary-300 dark:focus:ring-primary-600 h-4 w-4 rounded border border-gray-300 bg-gray-50 focus:ring-3 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800"
                      required
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="remember"
                      className="text-gray-500 dark:text-gray-300"
                    >
                      Remember me
                    </label>
                  </div>
                </div>

                <a
                  href="#"
                  className="text-primary-600 dark:text-primary-500 text-sm font-medium hover:underline"
                  onClick={() => setfroget(!forget)}
                >
                  {forget ? "Login" : "Forgot password?"}
                </a>
              </div>
              <Button
                color={"purple"}
                className="w-full"
                type="submit"
                disabled={loginData.loading}
              >
                {loginData.loading
                  ? "Loading..."
                  : !forget
                    ? "Login"
                    : "Forget Password"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
