import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import AuthContainer from '../auth/AuthContainer';

class LandingPage extends React.Component {
  componentDidMount() {
    if (this.props.isLoggedIn) {
      this.props.dispatch(push('/profile'));
    }
  }
  render() {
    return (
      <div className="container--content">
        <h1>Sign up for our alert service and never miss another emergency notification.</h1>
        <AuthContainer />
      </div>
    );
  }
}

LandingPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
};

function mapStateToProps(state) {
  return {
    isLoggedIn: !!state.auth.get('email'),
  };
}

export default connect(mapStateToProps)(LandingPage);
