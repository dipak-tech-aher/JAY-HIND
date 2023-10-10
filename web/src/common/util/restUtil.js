import axios from "axios";
import { toast } from "react-toastify";
import { properties } from "../../properties";
import { hideSpinner, showSpinner } from "../spinner";
import { history } from "./history";
import { isEmpty } from 'lodash'
export const isLoading = false;

const { API_ENDPOINT } = properties;
let accessToken; let refreshToken;
let queuedRequests = []
let refreshInProgress = false;
const errorMessage = "Currently, we are facing some technical issues. Please try after some time."

export const initToken = () => {
  accessToken =
    JSON.parse(sessionStorage.getItem("auth")) && JSON.parse(sessionStorage.getItem("auth")) !== null
      ? JSON.parse(sessionStorage.getItem("auth")).accessToken
      : "";
};

const initRefreshToken = () => {
  refreshToken = JSON.parse(sessionStorage.getItem("auth")) && JSON.parse(sessionStorage.getItem("auth")) !== null
    ? JSON.parse(sessionStorage.getItem("auth")).refreshToken
    : "";
}

export const setAccessToken = (token) => {
  accessToken = token;
};

function clean(obj) {
  for (var propName in obj) {
    const value = obj[propName];
    if (value === null || value === undefined || value === "") {
      delete obj[propName];
    }
  }
}

export const get = (api, params, contentType = "application/json") => {
  if (!accessToken) initToken();
  clean(params);
  showSpinner()
  return new Promise((resolve, reject) => {
    let url = `${API_ENDPOINT}${api}`;
    if (params) {
      const keys = Object.keys(params);
      let query = keys.map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(params[k])).join("&");
      if (keys.length) {
        url = `${url}?${query}`;
      }
    }

    axios(url, {
      method: "GET",
      headers: {
        "Content-Type": contentType,
        authorization: accessToken,
        "x-tenant-id": properties.REACT_APP_TENANT_ID //getTenantId()
      },
    }).then((response) => {
      const resp = response?.data ? response?.data : response
      if (resp?.status && resp?.status >= 200 && resp?.status < 300) {
        return resolve(resp);
      }
    }).catch((error) => {
      return reject(handleError(error))
    }).finally((res) => {
      hideSpinner();
    });
  });
};

export const slowGet = (api, params, contentType = "application/json") => {
  if (!accessToken) initToken();
  clean(params);
  return new Promise((resolve, reject) => {
    let url = `${API_ENDPOINT}${api}`;
    if (params) {
      const keys = Object.keys(params);
      let query = keys.map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(params[k])).join("&");
      if (keys.length) {
        url = `${url}?${query}`;
      }
    }

    axios(url, {
      method: "GET",
      headers: {
        "Content-Type": contentType,
        authorization: accessToken,
        "x-tenant-id": properties.REACT_APP_TENANT_ID //getTenantId()
      },
    }).then((response) => {
      const resp = response?.data ? response?.data : response
      if (resp?.status && resp?.status >= 200 && resp?.status < 300) {
        return resolve(resp);
      }
    }).catch((error) => {
      return reject(handleError(error))
    }).finally()
  });
};

// export const slowGet = async (api, params, contentType = "application/json") => {
//   if (!accessToken) initToken();
//   clean(params);

//   let url = `${API_ENDPOINT}${api}`;
//   if (params) {
//     const keys = Object.keys(params);
//     let query = keys.map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(params[k])).join("&");
//     if (keys.length) {
//       url = `${url}?${query}`;
//     }
//   }

//   axios(url, {
//     method: "GET",
//     headers: {
//       "Content-Type": contentType,
//       authorization: accessToken,
//       "x-tenant-id": properties.REACT_APP_TENANT_ID
//     },
//   }).then((response) => {
//     const data = response?.data ? response?.data?.json() : {}
//     return data
//   }).catch((error) => {
//     handleError(error);
//   }).finally();
// };

export const getBinary = (api, params, contentType = "application/json") => {
  if (!accessToken) initToken();
  clean(params);
  return new Promise((resolve, reject) => {
    let url = `${API_ENDPOINT}${api}`;
    if (params) {
      const keys = Object.keys(params);
      let query = keys.map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(params[k])).join("&");
      if (keys.length) {
        url = `${url}?${query}`;
      }
    }

    axios(url, {
      method: "GET",
      headers: {
        authorization: accessToken,
        "x-tenant-id": properties.REACT_APP_TENANT_ID,
        "Content-Type": contentType
      },
    }).then((response) => {
      const resp = response?.data ? response?.data : response
      if (resp?.status && resp?.status >= 200 && resp?.status < 300) {
        return resolve(resp.blob());
      }
    }).catch((error) => {
      handleError(error);
    });
  });
};

export const post = (api, body, contentType = "application/json") => {
  if (!accessToken) initToken();
  showSpinner()
  return new Promise((resolve, reject) => {
    axios.post(API_ENDPOINT + api, body, {
      headers: {
        "Content-Type": contentType,
        "x-tenant-id": properties.REACT_APP_TENANT_ID,
        authorization: accessToken
      }
      // body: JSON.stringify(body),
    }).then((response) => {
      const resp = response?.data ? response?.data : response
      if (resp?.status && resp?.status >= 200 && resp?.status < 300) {
        return resolve(resp);
      }
    }).catch((error) => {
      return reject(handleError(error))
    }).finally(() => {
      hideSpinner();
    });
  });
};

export const slowPost = (api, body, contentType = "application/json") => {
  if (!accessToken) initToken();
  return new Promise((resolve, reject) => {
    axios.post(API_ENDPOINT + api, body, {
      headers: {
        "Content-Type": contentType,
        authorization: accessToken,
        "x-tenant-id": properties.REACT_APP_TENANT_ID //getTenantId()
      }
    }).then((response) => {
      const resp = response?.data ? response?.data : response
      if (resp.status && resp.status >= 200 && resp.status < 300) {
        return resolve(resp);
      }
    }).catch((error) => {
      handleError(error);
    }).finally((res) => {
    });
  });
};

export const put = (api, body, contentType = "application/json") => {
  if (!accessToken) initToken();
  showSpinner()
  return new Promise((resolve, reject) => {
    axios.put(API_ENDPOINT + api, body, {
      headers: {
        "Content-Type": contentType,
        authorization: accessToken,
        "x-tenant-id": properties.REACT_APP_TENANT_ID //getTenantId()
      }
      // body: JSON.stringify(body),
    }).then((response) => {
      const resp = response?.data ? response?.data : response
      if (resp?.status && resp?.status >= 200 && resp?.status < 300) {
        return resolve(resp);
      }
    }).catch((error) => {
      handleError(error);
    }).finally(() => {
      hideSpinner()
    });
  });
};

export const slowPut = (api, body, contentType = "application/json") => {
  if (!accessToken) initToken();
  return new Promise((resolve, reject) => {
    axios.put(API_ENDPOINT + api, body, {
      headers: {
        "Content-Type": contentType,
        authorization: accessToken,
        "x-tenant-id": properties.REACT_APP_TENANT_ID //getTenantId()
      }
      // body: JSON.stringify(body),
    }).then((response) => {
      const resp = response?.data ? response?.data : response
      if (resp?.status && resp?.status >= 200 && resp?.status < 300) {
        return resolve(resp);
      }
    }).catch((error) => {
      handleError(error);
    }).finally()
  });
};

export const remove = (api, contentType = "application/json") => {
  if (!accessToken) initToken();
  showSpinner()
  return new Promise((resolve, reject) => {
    axios(API_ENDPOINT + api, {
      method: "DELETE",
      headers: {
        "Content-Type": contentType,
        authorization: accessToken,
        "x-tenant-id": properties.REACT_APP_TENANT_ID //getTenantId()
      }
    }).then((response) => {
      const resp = response?.data ? response?.data : response
      if (resp?.status && resp?.status >= 200 && resp?.status < 300) {

        return resolve(resp);
      }
    }).catch((error) => {
      handleError(error);
    }).finally(() => {
      hideSpinner();
    })
  })
};

export const patch = (api, body, contentType = "application/json") => {
  if (!accessToken) initToken();
  return new Promise((resolve, reject) => {
    axios.patch(API_ENDPOINT + api, body, {
      headers: {
        "Content-Type": contentType,
        authorization: accessToken,
        "x-tenant-id": properties.REACT_APP_TENANT_ID //getTenantId()
      }
      // body: JSON.stringify(body),
    }).then((response) => {
      const resp = response?.data ? response?.data : response
      if (resp?.status && resp?.status >= 200 && resp?.status < 300) {
        return resolve(resp);
      }
    }).catch((error) => {
      handleError(error);
    });
  });
};

const handleError = (error) => {
  try {
    const resp = error?.response ? error?.response?.data ? error?.response?.data : error?.response : {}
    const status = error?.response ? error?.response?.status ? error?.response?.status : '' : '';
    switch (status) {
      case 401:
        sessionStorage.removeItem("auth");
        setAccessToken('')
        history.push(`${properties.REACT_APP_BASE}/clearAuth`);
        toast.error(resp?.message ? resp?.message : "Not Authorized", { toastId: "error" });
        break;
      case 404:
        break
      case 400:
        break
      // case 409:
      //   break
      default:
        resp.message = !isEmpty(resp) ? typeof resp === 'object' ? resp?.message || errorMessage : errorMessage : errorMessage;
        toast.error(!isEmpty(resp) ? typeof resp === 'object' ? resp?.message || errorMessage : errorMessage : errorMessage, { toastId: "error" });
        break;
    }
    return resp;
  } catch (error) {
    console.error(error)
    const responseData = {}
    responseData.message = errorMessage
    return responseData
  }
};

export const getSmartenAPI = (api, params) => {
  if (!accessToken) initToken();
  clean(params);
  return new Promise((resolve, reject) => {
    let url = `${api}`;
    if (params) {
      const keys = Object.keys(params);
      let query = keys.map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(params[k])).join("&");
      if (keys.length) {
        url = `${url}?${query}`;
      }
    }

    fetch(url, {
      method: "GET",
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
    }).then((response) => {
      const resp = response?.data ? response?.data : response
      if (resp?.status && resp?.status >= 200 && resp?.status < 300) {
        return resolve(resp);
      }
    }).catch((error) => {
      handleError(error);
    });;
  });
};

const isUnauthorizedError = (error) => {
  const { response: { status } } = error
  return status === 401;
}

export const renewToken = async () => {
  if (!refreshToken) {
    throw new Error('refresh token does not exist');
  }
  const refreshPayload = {
    refreshToken: refreshToken
  };

  const url = `${API_ENDPOINT}${properties.AUTH_API}/refresh-token`
  return new Promise((resolve, reject) => {
    axios.post(url, refreshPayload, {
      headers: {
        "Content-Type": "application/json",
        "x-tenant-id": properties.REACT_APP_TENANT_ID
      }
    }).then((response) => {
      const resp = response?.data ? response?.data : response
      if (resp?.status && resp?.status >= 200 && resp?.status < 300 && resp?.data?.accessToken && resp?.data?.refreshToken) {
        const accessToken = resp?.data?.accessToken;
        const refreshToken = resp?.data?.refreshToken;
        retryQueuedRequests(accessToken);
        return resolve({ accessToken, refreshToken });
      }
    }).catch((error) => {
      console.error(error)
      retryQueuedRequests();
      return reject(error);
    })
      .finally(() => {
        refreshInProgress = false
      })
  })
}


axios.interceptors.response.use(
  (res) => res,
  async (error) => {
    try {
      initRefreshToken()
      const originalConfig = error.config;

      if (!accessToken || !isUnauthorizedError(error)) {
        return Promise.reject(error);
      }
      const urlData = originalConfig?.url?.split('/api/auth/')?.[1]
      if (error.response.status === 401 && urlData === 'refresh-token') {
        return Promise.reject(error);
      }

      if (error.response.status === 401 && !originalConfig._retry) {
        originalConfig._retry = true;
        const retryPromise = new Promise((resolve, reject) => {
          queuedRequests.push({
            config: originalConfig, resolve, reject
          });
        });

        if (!refreshInProgress) {
          refreshInProgress = true
          const { accessToken, refreshToken } = await renewToken();

          let sessionData = JSON.parse(sessionStorage.getItem("auth")) && JSON.parse(sessionStorage.getItem("auth")) !== null
            ? JSON.parse(sessionStorage.getItem("auth")) : {}
          sessionData = { ...sessionData, accessToken, refreshToken }

          sessionStorage.setItem("auth", JSON.stringify(sessionData));
          setAccessToken(accessToken)

        }
        return retryPromise;
      }
      return Promise.reject(error);
    } catch (error) {
      sessionStorage.removeItem("auth");
      setAccessToken('')
      history.push(`${properties.REACT_APP_BASE}/clearAuth`);
      toast.error("Not Authorized", { toastId: "error" });
      return Promise.reject(error);
    }
  }
)

const retryQueuedRequests = (accessToken) => {
  queuedRequests.forEach(({ config, resolve, reject }) => {
    if (accessToken) {
      config.headers.authorization = `${accessToken}`;
      axios(config)
        .then(resolve)
        .catch(reject)
    } else {
      reject({ message: "No access token found", status: 401 });
    }
  });
  return Promise.all(queuedRequests);
};
