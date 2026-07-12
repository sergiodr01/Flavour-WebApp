class User {
  constructor({ id, firstName, lastName, login, roles = [] }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.login = login;
    this.roles = roles;
  }

  hasRole(role) {
    return this.roles.includes(role);
  }

  isCustomer() {
    return this.hasRole('customer');
  }

  isFlavorist() {
    return this.hasRole('flavorist');
  }
}

module.exports = User;



