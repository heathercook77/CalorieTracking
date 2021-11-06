import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import deploymentConfig from '../Deployment/deploymentConfig';
import logo from '../resources/favicon.png';

class Footer extends Component {
  render() {
    return (
      <div className="Footer container">
        <img src={logo} alt="EasyCal" />
        

        {!this.props.onLogin && <span className="Footer__links">
        	<Link to={deploymentConfig().baseUrl + "/"}>Today's Log</Link><span className="Footer__link-separator">·</span>
        	<Link to={deploymentConfig().baseUrl + "/stats"}>Stats</Link><span className="Footer__link-separator">·</span>
        	<Link to={deploymentConfig().baseUrl + "/me"}>My Account</Link>
        </span>}

        <div className="clearfix"></div>
      </div>
    );
  }
}

export default Footer;
