import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

// For async/await.
import 'regenerator-runtime/runtime';

// Semantic UI CSS theme.
import 'semantic-ui-css/semantic.min.css';

import App from './components/app';

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById('root'),
);
