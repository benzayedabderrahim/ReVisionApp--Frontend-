import React, { useState } from "react";

const VerifyCode = ({ email }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://your-django-api.com/verify-code/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to verify code");
      }

      setMessage(data.message);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <form onSubmit={handleVerify}>
      <input
        type="text"
        placeholder="Enter your code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        required
      />
      <button type="submit">Verify Code</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}
    </form>
  );
};

export default VerifyCode;