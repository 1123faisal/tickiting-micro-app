import buildClient from "../api/build-client";

const LandingPage = ({ currentUser }) => {
  return <h1>{currentUser ? "You Are Sign In" : "You Are Not Sign In"}</h1>;
};

LandingPage.getInitialProps = async (context) => {
  const { data } = await buildClient(context).get("/api/users/currentuser");
  return data;
};

export default LandingPage;
