import React, { useContext } from "react";
import { Routes, Route, Redirect } from "react-router-dom";
import { AppContext } from "../AppContext";
import AppLayout from "./Layout/AppLayout";

export const PrivateRoute = ({ component: Component, layout: Layout, ...rest }) => {
  const { auth } = useContext(AppContext);
  let isAuthenticated = false;
  if (auth && auth.accessToken) {
    isAuthenticated = true;
    document.getElementById('navbarSupportedContent')?.classList?.remove('show');    
  }
  return (
    <Route
      {...rest}
      render={props =>
        isAuthenticated ? (
          <AppLayout isAuthenticated={isAuthenticated}>
            {
              Layout ?
                <Layout {...props}>
                  <Component key={new Date().getTime()} {...props} {...rest} />
                </Layout>
                :
                <Component key={new Date().getTime()} {...props} {...rest} />
            }
          </AppLayout>
        ) : (
          <Redirect to={`${process.env.REACT_APP_BASE}/user/login`} />
        )
      }
    />
  )
};

export const PublicRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={props =>
        <AppLayout>
          <Component {...props} />
        </AppLayout>
      } />
  )
};
