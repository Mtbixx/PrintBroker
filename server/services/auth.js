import bcrypt from 'bcrypt';
import { db } from '../db.js';
import { users } from '../schema.js';

class AuthService {
  async validateUser(email, password) {
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email)
    });

    if (!user) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return null;
    }

    return user;
  }

  async findUserByEmail(email) {
    return db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email)
    });
  }

  async createUser({ email, password, name, company, role }) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const [user] = await db.insert(users).values({
      email,
      password: hashedPassword,
      name,
      company,
      role,
      isActive: true
    }).returning();

    return user;
  }
}

export const authService = new AuthService(); 