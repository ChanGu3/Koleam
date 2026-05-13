export function Email(email) {
  if (!email.match(/([\w.+-]+)(@)([a-zA-Z]+)(\.)([a-zA-Z]+)/)) {
    return false;
  }

  return true;
}

export function PasswordLength(password) {
  if (password.length < 7) {
    return false;
  }

  return true;
}

const Validate = {
  Email,
  PasswordLength,
};

export default Validate;
