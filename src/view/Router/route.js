import React from 'react';
import {HashRouter as Router, Route} from 'react-router-dom';
import RouteInfo from './route_info';

class ViewRoute extends React.Component {
    render() {
        return (
            <Router>
                <Route component={RouteInfo}/>
            </Router>
        );
    }
}

export default ViewRoute;