import axios from "axios";

export default ({ req }) => {
  if (typeof window == "undefined") {
    return axios.create({
      baseURL:
        // "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local",
        "http://www.tickiting.site",
      headers: req.headers,
    });
  } else {
    return axios.create({
      baseURL: "/",
    });
  }
};
