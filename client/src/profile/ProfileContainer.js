import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import UserForm from './UserForm';
import ProfileForm from './ProfileForm';
import Addresses from './Addresses';
import { getProfile, updateProfile } from './profileActions';

class ProfileContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      updatingPassword: false,
      newAddressState: '',
    };

    this.submitUpdate = this.submitUpdate.bind(this);
    this.togglePasswordForm = this.togglePasswordForm.bind(this);
    this.saveNewAddress = this.saveNewAddress.bind(this);
    this.updateAddressState = this.updateAddressState.bind(this);
    this.removeAddress = this.removeAddress.bind(this);
    this.updatePassword = this.updatePassword.bind(this);
  }
  componentWillMount() {
    this.props.getProfile(this.props.user.access_token);
  }
  submitUpdate(values) {
    const newProfile = Object.assign({}, this.props.profile, values);
    this.props.updateProfile(this.props.user.access_token, newProfile);
  }
  togglePasswordForm(e) {
    e.preventDefault();
    this.setState({ updatingPassword: !this.state.updatingPassword });
  }
  updateAddressState(newState) {
    this.setState({ newAddressState: newState });
  }
  removeAddress(address) {
    const newProfile = Object.assign({}, this.props.profile);
    const loc = newProfile.addresses.indexOf(address);
    if (loc === -1) {
      console.error('Attempting to remove an address that is not in the list');
      return;
    }
    newProfile.addresses.splice(loc, 1);
    this.props.updateProfile(this.props.user.access_token, newProfile);
  }
  saveNewAddress(address) {
    const newAddress = {
      address: address.properties.label,
      latitude: address.geometry.coordinates[1],
      longitude: address.geometry.coordinates[0],
    };
    const newProfile = Object.assign({}, this.props.profile);
    newProfile.addresses.push(newAddress);
    this.props.updateProfile(this.props.user.access_token, newProfile);
    this.setState({ newAddressState: '' });
  }
  updatePassword(values) {
    console.log('updating password');
    console.log(this);
    console.log(values);
  }
  render() {
    return (
      <div className="container--content">
        <UserForm
          userEmail={this.props.user.email}
          togglePasswordForm={this.togglePasswordForm}
          updatingPassword={this.state.updatingPassword}
          onSubmit={this.updatePassword}
        />
        { !(this.props.profile && this.props.profile.addresses) ? (
          <div>loading profile...</div>
          ) : (
            <div>
              <ProfileForm
                profile={this.props.profile}
                onSubmit={this.submitUpdate}
                initialValues={this.props.profile}
              />
              <Addresses
                addresses={this.props.profile.addresses}
                saveNewAddress={this.saveNewAddress}
                updateAddressState={this.updateAddressState}
                addressFieldState={this.state.newAddressState}
                removeAddress={this.removeAddress}
              />
            </div>
          )}
      </div>
    );
  }
}

ProfileContainer.propTypes = {
  profile: PropTypes.object,
  user: PropTypes.object.isRequired,
  getProfile: PropTypes.func.isRequired,
  updateProfile: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    profile: state.profile.get('profile'),
    user: state.auth.get('user'),
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ getProfile, updateProfile }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfileContainer);
