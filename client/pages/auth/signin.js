import { useRouter } from "next/router";
import { useState } from "react";
import useRequest from "../../hooks/use-request";

export default function SignUp() {
  const [email, set_email] = useState("");
  const [password, set_password] = useState("");
  const router = useRouter();

  const { doRequest, errors } = useRequest({
    url: "/api/users/signin",
    method: "post",
    body: {
      email,
      password,
    },
    onSuccess: (data) => router.replace("/"),
  });

  async function submitForm(event) {
    event.preventDefault();

    await doRequest();

    // emailRef.current.value = "";
    // passwordRef.current.value = "";
  }

  return (
    <form onSubmit={submitForm}>
      <h1>Sign In</h1>
      <div className="form-group">
        <label>Email Address</label>
        <input
          onChange={(e) => set_email(e.target.value)}
          type="email"
          className="form-control"
        />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input
          onChange={(e) => set_password(e.target.value)}
          type="password"
          className="form-control"
        />
      </div>

      {errors}

      <button className="btn btn-primary">Sign In</button>
    </form>
  );
}
