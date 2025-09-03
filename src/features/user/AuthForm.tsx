"use client";
import React, { useState } from "react";
import api from "@/features/user/api";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    age: "",
    gender: "MALE",
    tendency: "NEUTRAL", // 기본값을 유효한 값으로
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        // 로그인
        const res = await api.post("/api/v1/auth/login", {
          username: form.username,
          password: form.password,
        });
        localStorage.setItem("accessToken", res.data.data.accessToken);
        alert("로그인 성공!");
        window.location.href = "/user";
      } else {
        // 회원가입
        await api.post("/api/v1/members", {
          userId: form.username,
          password: form.password,
          email: form.email,
          age: parseInt(form.age, 10),
          gender: form.gender,
          tendency: form.tendency,
        });
        alert("회원가입 성공! 이제 로그인하세요.");
        setIsLogin(true);
      }
    } catch (err: any) {
      alert("에러 발생: " + (err.response?.data?.msg || err.message));
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto mt-10 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">{isLogin ? "로그인" : "회원가입"}</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          name="username"
          placeholder="아이디"
          value={form.username}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="비밀번호"
          value={form.password}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />

        {!isLogin && (
          <>
            <input
              type="email"
              name="email"
              placeholder="이메일"
              value={form.email}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
            <input
              type="number"
              name="age"
              placeholder="나이"
              value={form.age}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="MALE">남성</option>
              <option value="FEMALE">여성</option>
            </select>
            <select
              name="tendency"
              value={form.tendency}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="COLD_SENSITIVE">추위를 잘 탐</option>
              <option value="NEUTRAL">중간형</option>
              <option value="HEAT_SENSITIVE">더위를 잘 탐</option>
            </select>
          </>
        )}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded"
        >
          {isLogin ? "로그인" : "회원가입"}
        </button>
      </form>

      <div className="mt-4 text-center">
        {isLogin ? (
          <p>
            계정이 없으신가요?{" "}
            <button
              onClick={() => setIsLogin(false)}
              className="text-blue-500 underline"
            >
              회원가입
            </button>
          </p>
        ) : (
          <p>
            이미 계정이 있으신가요?{" "}
            <button
              onClick={() => setIsLogin(true)}
              className="text-blue-500 underline"
            >
              로그인
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
