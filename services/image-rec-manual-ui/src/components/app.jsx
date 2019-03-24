import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import PageMenu from './page-menu';
import Classifier from '../pages/classifier';
import Explorer from '../pages/explorer';
import LiveView from '../pages/live-view';
import Map from '../pages/map';
import PageNotFound from '../pages/page-not-found';
import Pipeline from '../pages/pipeline';
import Targets from '../pages/targets';

import './app.css';

const App = () => (
  <div className='page-wrapper'>
    <PageMenu />
    <main>
      <Switch>
        <Redirect exact from='(/|/app)' to='/app/explorer' />
        <Route exact path='/app/explorer' component={Explorer} />
        <Route exact path='/app/classifier' component={Classifier} />
        <Route exact path='/app/targets' component={Targets} />
        <Route exact path='/app/map' component={Map} />
        <Route exact path='/app/live-view' component={LiveView} />
        <Route exact path='/app/pipeline' component={Pipeline} />
        <Route component={PageNotFound} />
      </Switch>
    </main>
  </div>
);

export default App;
