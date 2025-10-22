const bcrypt = require("bcryptjs");

class UserModel {
  constructor() {
    this.users = [];
    this.nextId = 1;
  }

  async addUser(user) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const userWithHashedPassword = {
      id: this.nextId++,
      username: user.username,
      email: user.email,
      password: hashedPassword,
    };
    this.users.push(userWithHashedPassword);
    return userWithHashedPassword;
  }

  findByUsername(username) {
    return this.users.find((user) => user.username === username);
  }

  findByEmail(email) {
    return this.users.find((user) => user.email === email);
  }
}

module.exports = new UserModel();
