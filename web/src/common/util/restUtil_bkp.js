import { properties } from "../../properties";
import { history } from "./history";
import { toast } from "react-toastify";
import { showSpinner, hideSpinner } from "../spinner";

const { API_ENDPOINT } = properties;
export const isLoading = false;


let accessToken
const initToken = () => {
  accessToken =
    JSON.parse(sessionStorage.getItem("auth")) && JSON.parse(sessionStorage.getItem("auth")) !== null
      ? JSON.parse(sessionStorage.getItem("auth")).accessToken
      : "";
};
export const setAccessToken = (token) => {
  accessToken = token;
};

// const getTenantId = (api, body) => {
//   let loginId;
//   if (api?.includes("auth/login")) {
//     loginId = body?.loginId;
//   } 
//   else if (JSON.parse(sessionStorage.getItem("auth")) && JSON.parse(sessionStorage.getItem("auth")) !== null) {
//     loginId = JSON.parse(sessionStorage.getItem("auth"))?.user?.email;
//   }

//   let QALoginIds = process.env.REACT_APP_QA_EMAIL_IDS?.split(",");
//   if (QALoginIds?.includes(loginId)) {
//     return process.env.REACT_APP_QA_TENANT_ID;
//   }

//   return properties.REACT_APP_TENANT_ID;
// }

function clean(obj) {
  for (var propName in obj) {
    const value = obj[propName];
    if (value === null || value === undefined || value === "") {
      delete obj[propName];
    }
  }
}

export const get = (api, params) => {
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

    fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: accessToken,
        "x-tenant-id": properties.REACT_APP_TENANT_ID //getTenantId()
      },
    }).then((resp) => {
      if (resp?.status && resp?.status === 200) {
        if (resp?.refreshToken && resp?.refreshToken !== null && resp?.refreshToken !== undefined) {
          let object = JSON.parse(sessionStorage.getItem("auth"))
          object["accessToken"] = resp?.refreshToken;
          sessionStorage.setItem("auth", JSON.stringify(object));
          initToken();
        }
        return resolve(resp.json());
      } else {
        if (resp?.refreshToken && resp?.refreshToken !== null && resp?.refreshToken !== undefined) {
          let object = JSON.parse(sessionStorage.getItem("auth"))
          object["accessToken"] = resp?.refreshToken;
          sessionStorage.setItem("auth", JSON.stringify(object));
          initToken();
        }
        handleError(resp);
        return reject(resp);
      }
    }).catch((error) => {
      console.log(error)
    }).finally((res) => {
      hideSpinner();
    });
  });
};

export const slowGet = async (api, params) => {
  if (!accessToken) initToken();
  clean(params);

  let url = `${API_ENDPOINT}${api}`;
  if (params) {
    const keys = Object.keys(params);
    let query = keys.map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(params[k])).join("&");
    if (keys.length) {
      url = `${url}?${query}`;
    }
  }

  const resp = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      authorization: accessToken,
      "x-tenant-id": properties.REACT_APP_TENANT_ID //getTenantId()
    },
  });
  const data = await resp.json()
  return data
};

export const getBinary = (api, params) => {
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

    fetch(url, {
      method: "GET",
      headers: {
        authorization: accessToken,
        "x-tenant-id": properties.REACT_APP_TENANT_ID //getTenantId()
      },
    }).then((resp) => {
      if (resp.status && resp.status === 200) {
        if (resp?.refreshToken && resp?.refreshToken !== null && resp?.refreshToken !== undefined) {
          let object = JSON.parse(sessionStorage.getItem("auth"))
          object["accessToken"] = resp?.refreshToken;
          sessionStorage.setItem("auth", JSON.stringify(object));
          initToken();
        }
        return resolve(resp.blob());
      } else {
        if (resp?.refreshToken && resp?.refreshToken !== null && resp?.refreshToken !== undefined) {
          let object = JSON.parse(sessionStorage.getItem("auth"))
          object["accessToken"] = resp?.refreshToken;
          sessionStorage.setItem("auth", JSON.stringify(object));
          initToken();
        }
        handleError(resp);
        return reject(resp);
      }
    }).catch((error) => {
      console.log(error)
    });
  });
};

export const post = (api, body) => {
  if (!accessToken) initToken();
  showSpinner()
  return new Promise((resolve, reject) => {
    fetch(API_ENDPOINT + api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: accessToken,
        "x-tenant-id": properties.REACT_APP_TENANT_ID //getTenantId()
      },
      body: JSON.stringify(body),
    }).then((resp) => {
      if (resp?.status && resp?.status >= 200 && resp?.status < 300) {
        if (resp?.refreshToken && resp?.refreshToken !== null && resp?.refreshToken !== undefined) {
          let object = JSON.parse(sessionStorage.getItem("auth"))
          object["accessToken"] = resp?.refreshToken;
          sessionStorage.setItem("auth", JSON.stringify(object));
          initToken();
        }
        return resolve(resp.json());
      } else {
        // console.log('inside else failure ', resp)
        if (resp?.refreshToken && resp?.refreshToken !== null && resp?.refreshToken !== undefined) {
          let object = JSON.parse(sessionStorage.getItem("auth"))
          object["accessToken"] = resp?.refreshToken;
          sessionStorage.setItem("auth", JSON.stringify(object));
          initToken();
        }
        handleError(resp);
        return reject(resp);
      }
    }).catch((error) => {
      console.log(error)
    }).finally((res) => {
      hideSpinner();
    });
  });
};

export const slowPost = (api, body) => {
  if (!accessToken) initToken();
  // if(!refreshToken) initRefreshToken();
  return new Promise((resolve, reject) => {
    fetch(API_ENDPOINT + api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: accessToken,
        // "x-refresh-token": refreshToken,
        "x-tenant-id": properties.REACT_APP_TENANT_ID //getTenantId()
      },
      body: JSON.stringify(body),
    }).then((resp) => {
      if (resp.status && resp.status >= 200 && resp.status < 300) {
        if (resp?.refreshToken && resp?.refreshToken !== null && resp?.refreshToken !== undefined) {
          let object = JSON.parse(sessionStorage.getItem("auth"))
          object["accessToken"] = resp?.refreshToken;
          sessionStorage.setItem("auth", JSON.stringify(object));
          initToken();
        }
        return resolve(resp.json());
      } else {
        // console.log('inside else failure ', resp)
        if (resp?.refreshToken && resp?.refreshToken !== null && resp?.refreshToken !== undefined) {
          let object = JSON.parse(sessionStorage.getItem("auth"))
          object["accessToken"] = resp?.refreshToken;
          sessionStorage.setItem("auth", JSON.stringify(object));
          initToken();
        }
        handleError(resp);
        return reject(resp);
      }
    }).catch((error) => {
      console.log(error)
    }).finally((res) => {
    });
  });
};

export const put = (api, body) => {
  if (!accessToken) initToken();
  showSpinner()
  return new Promise((resolve, reject) => {
    fetch(API_ENDPOINT + api, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: accessToken,
        "x-tenant-id": properties.REACT_APP_TENANT_ID //getTenantId()
      },
      body: JSON.stringify(body),
    }).then((resp) => {
      if (resp.status && resp.status === 200) {
        if (resp?.refreshToken && resp?.refreshToken !== null && resp?.refreshToken !== undefined) {
          let object = JSON.parse(sessionStorage.getItem("auth"))
          object["accessToken"] = resp?.refreshToken;
          sessionStorage.setItem("auth", JSON.stringify(object));
          initToken();
        }
        return resolve(resp.json());
      } else {
        if (resp?.refreshToken && resp?.refreshToken !== null && resp?.refreshToken !== undefined) {
          let object = JSON.parse(sessionStorage.getItem("auth"))
          object["accessToken"] = resp?.refreshToken;
          sessionStorage.setItem("auth", JSON.stringify(object));
          initToken();
        }
        console.error('Fetch Error', resp.status)
        handleError(resp);
        return reject(resp);
      }
    }).catch((error) => {
      console.log(error)
    }).finally((res) => {
      hideSpinner();
    });
  });
};

export const remove = (api) => {
  if (!accessToken) initToken();
  return new Promise((resolve, reject) => {
    fetch(API_ENDPOINT + api, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        authorization: accessToken,
        "x-tenant-id": properties.REACT_APP_TENANT_ID //getTenantId()
      }
    }).then((resp) => {
      if (resp.status && resp.status === 200) {
        if (resp?.refreshToken && resp?.refreshToken !== null && resp?.refreshToken !== undefined) {
          let object = JSON.parse(sessionStorage.getItem("auth"))
          object["accessToken"] = resp?.refreshToken;
          sessionStorage.setItem("auth", JSON.stringify(object));
          initToken();
        }
        return resolve(resp.json());
      } else {
        if (resp?.refreshToken && resp?.refreshToken !== null && resp?.refreshToken !== undefined) {
          let object = JSON.parse(sessionStorage.getItem("auth"))
          object["accessToken"] = resp?.refreshToken;
          sessionStorage.setItem("auth", JSON.stringify(object));
          initToken();
        }
        handleError(resp);
        return reject(resp);
      }
    }).catch((error) => {
      console.log(error)
    });
  });
};

export const patch = (api, body) => {
  if (!accessToken) initToken();
  return new Promise((resolve, reject) => {
    fetch(API_ENDPOINT + api, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        authorization: accessToken,
        "x-tenant-id": properties.REACT_APP_TENANT_ID //getTenantId()
      },
      body: JSON.stringify(body),
    }).then((resp) => {
      if (resp.status && resp.status === 200) {
        if (resp?.refreshToken && resp?.refreshToken !== null && resp?.refreshToken !== undefined) {
          let object = JSON.parse(sessionStorage.getItem("auth"))
          object["accessToken"] = resp?.refreshToken;
          sessionStorage.setItem("auth", JSON.stringify(object));
          initToken();
        }
        return resolve(resp.json());
      } else {
        if (resp?.refreshToken && resp?.refreshToken !== null && resp?.refreshToken !== undefined) {
          let object = JSON.parse(sessionStorage.getItem("auth"))
          object["accessToken"] = resp?.refreshToken;
          sessionStorage.setItem("auth", JSON.stringify(object));
          initToken();
        }
        handleError(resp);
        return reject(resp);
      }
    }).catch((error) => {
      console.log(error)
    });
  });
};

const handleError = async (resp) => {
  const status = resp?.status;
  const error = await resp?.json().then((resp) => {
    console.error(resp);
    switch (status) {
      case 401:
        sessionStorage.removeItem("auth");
        setAccessToken('')
        history.push(`${properties.REACT_APP_BASE}/clearAuth`);
        toast.error(resp.message ? resp.message : "Some error has occured...", { toastId: "error" });
        break;
      case 400:
      case 404:
        break;
      case 409:
      default:
        resp.message = typeof resp?.message === 'object' ? JSON.stringify(resp.message) : resp?.message || 'Some error has occured...';
        toast.error(resp?.message ? resp?.message : "Some error has occured...", { toastId: "error" });
        break;
    }
    return resp;
  }).catch((error) => {
    console.log(error)
  });
  return error;
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
    }).then((resp) => {
      if (resp.status && resp.status === 200) {
        if (resp?.refreshToken && resp?.refreshToken !== null && resp?.refreshToken !== undefined) {
          let object = JSON.parse(sessionStorage.getItem("auth"))
          object["accessToken"] = resp?.refreshToken;
          sessionStorage.setItem("auth", JSON.stringify(object));
          initToken();
        }
        return resolve(resp.json());
      } else {
        if (resp?.refreshToken && resp?.refreshToken !== null && resp?.refreshToken !== undefined) {
          let object = JSON.parse(sessionStorage.getItem("auth"))
          object["accessToken"] = resp?.refreshToken;
          sessionStorage.setItem("auth", JSON.stringify(object));
          initToken();
        }
        handleError(resp);
        return reject(resp);
      }
    }).catch((error) => {
      console.log(error)
  });
  });
};