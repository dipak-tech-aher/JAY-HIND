import React, { useContext } from "react";
import { Redirect } from "react-router-dom";
import { properties } from "../properties";
import { AppContext } from "../AppContext";
import { remove } from "../common/util/restUtil";
import {  } from "./spinner";

const Logout = () => {
  const { setAuth } = useContext(AppContext);
  let userId =
    JSON.parse(sessionStorage.getItem("auth")) && JSON.parse(sessionStorage.getItem("auth")) !== null
      ? JSON.parse(sessionStorage.getItem("auth")).user.userId
      : "";
  remove(properties.AUTH_API + "/logout/" + userId)
    .then((resp) => {
      if (resp.status === 200) {
        setAuth({});
      } else {
      }
      sessionStorage.removeItem("auth");
      sessionStorage.removeItem("appConfig");
    }

    ).catch((error) => {
      console.log(error)
  })
    .finally();
  return <Redirect to={`${process.env.REACT_APP_BASE}/user/login`}></Redirect>;

};

export default Logout;
