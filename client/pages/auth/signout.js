import { useRouter } from "next/router";
import useRequest from "../../hooks/use-request";
import { useEffect } from "react";

export default () => {
  const router = useRouter();

  const { doRequest, errors } = useRequest({
    url: "/api/users/signout",
    body: {},
    method: "post",
    onSuccess: (data) => router.push("/"),
  });

  useEffect(() => {
    doRequest();
  }, []);

  return <h1>Signing you out...</h1>;
};
