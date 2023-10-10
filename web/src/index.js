import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider } from "./AppContext";
import App from "./App";
import './assets/css/bootstrap-creative.min.css';
import './assets/css/app-creative.css';
import './assets/css/app-responsive.css';
//import './assets/css/app-skeleton.css';
import './assets/css/icons.min.css';
//  import './assets/css/livechat.css'
import './index.css';
import Spinner from "./common/spinner";
import "./i18next";
import "react-toastify/dist/ReactToastify.css";
import 'react-quill/dist/quill.snow.css';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import 'react-autocomplete-input/dist/bundle.css';
import 'draft-js/dist/Draft.css';
import 'rsuite/dist/rsuite.min.css';
import './assets/css/style.css';
import 'odometer/themes/odometer-theme-default.css';
import 'react-confirm-alert/src/react-confirm-alert.css';

//import { toast } from "react-toastify";
import Theme from '../src/common/Theme.jsx';
// toast.configure();


const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <AppProvider>
    <Theme>
      <App />
      <Spinner />
    </Theme>
  </AppProvider>
);