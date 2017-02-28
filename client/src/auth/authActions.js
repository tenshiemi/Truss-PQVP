import { push } from 'react-router-redux';
import actionHelpers from '../utils/actionHelpers';
import * as types from '../constants/actionTypes';
import { displayAlert } from '../app/appActions';

export function logOutUser() {
  return { type: types.USER_LOGOUT };
}

export function saveUser(email, authToken) {
  const userInfo = { email, authToken };
  return { type: types.SAVE_USER, userInfo };
}

export function authenticateUser(email, password) {
  const config = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  };

  return dispatch => fetch('api/login', config)
  .then(actionHelpers.checkStatus)
  .then(actionHelpers.parseJSON)
  .then((response) => {
    dispatch(saveUser(response));
    dispatch(push('/profile'));
  })
  .catch(() => {
    dispatch(displayAlert(
      'usa-alert-error',
      'Error',
      'Unable to log in, please try again'
    ));
  });
}

export function signUpUser(email, password) {
  const config = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  };

  return dispatch => fetch('api/signup', config)
  .then(actionHelpers.checkStatus)
  .then(actionHelpers.parseJSON)
  .then((response) => {
    dispatch(saveUser(response));
    dispatch(push('/profile'));
  })
  .catch(() => {
    dispatch(displayAlert(
      'usa-alert-error',
      'Error',
      'Unable to create account, please try again later'
    ));
  });
}
