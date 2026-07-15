import React, { useState } from "react";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-start justify-center px-6 pt-12 pb-12 relative overflow-hidden">

      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-slate-200/30 rounded-full blur-3xl -translate-x-32 -translate-y-32"></div>

      <div className="absolute bottom-0 right-0 w-96 h-96 bg-slate-300/20 rounded-full blur-3xl translate-x-32 translate-y-32"></div>

      <div className="w-full max-w-md relative z-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-slate-900 rounded-[30px] shadow-[0_25px_50px_rgba(15,23,42,0.25)]">
            <User size={36} className="text-white" />
          </div>

          <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900">
            Create Account
          </h1>

          <p className="text-slate-500 text-sm font-medium mt-3 leading-relaxed">
            Create your organization account and start managing finances.
          </p>
        </div>

        {/* Card */}
        <div
          className="
          bg-white/90
          backdrop-blur-xl
          rounded-[32px]
          border
          border-white
          shadow-[0_30px_80px_rgba(15,23,42,0.08)]
          p-8
          "
        >
          <form className="space-y-5">

            {/* Name */}
            <div>
              <label className="block mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                Full Name
              </label>

              <div className="relative">
                <User
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  placeholder="Enter full name"
                  className="
                  w-full
                  pl-12
                  pr-4
                  py-3.5
                  bg-slate-50
                  border
                  border-slate-200
                  rounded-2xl
                  font-semibold
                  outline-none
                  transition-all
                  duration-300
                  hover:border-slate-300
                  focus:border-slate-900
                  focus:ring-4
                  focus:ring-slate-900/5
                  focus:scale-[1.01]
                  "
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="email"
                  placeholder="Enter email address"
                  className="
                  w-full
                  pl-12
                  pr-4
                  py-3.5
                  bg-slate-50
                  border
                  border-slate-200
                  rounded-2xl
                  font-semibold
                  outline-none
                  transition-all
                  duration-300
                  hover:border-slate-300
                  focus:border-slate-900
                  focus:ring-4
                  focus:ring-slate-900/5
                  focus:scale-[1.01]
                  "
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                Password
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create strong password"
                  className="
                  w-full
                  pl-12
                  pr-12
                  py-3.5
                  bg-slate-50
                  border
                  border-slate-200
                  rounded-2xl
                  font-semibold
                  outline-none
                  transition-all
                  duration-300
                  hover:border-slate-300
                  focus:border-slate-900
                  focus:ring-4
                  focus:ring-slate-900/5
                  focus:scale-[1.01]
                  "
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Security Note */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-4">
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                🔒 Your account information is encrypted and securely stored
                using enterprise-grade protection.
              </p>
            </div>

            {/* Button */}
            <button
              type="submit"
              className="
              w-full
              bg-slate-900
              hover:bg-slate-800
              text-white
              py-4
              rounded-2xl
              font-black
              uppercase
              tracking-[0.15em]
              flex
              items-center
              justify-center
              gap-3
              transition-all
              duration-300
              shadow-[0_15px_40px_rgba(15,23,42,0.25)]
              hover:-translate-y-1
              hover:shadow-[0_25px_50px_rgba(15,23,42,0.35)]
              "
            >
              Create Account
              <ArrowRight size={18} />
            </button>

          </form>
        </div>

        {/* Footer Text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400 font-medium">
            Secure Accounting Management System
          </p>
        </div>

      </div>
    </div>
  );
}