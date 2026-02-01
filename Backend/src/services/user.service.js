import { prisma } from "../config/db.js";
import bcrypt from "bcryptjs";
import { ApiError } from "../utils/ApiError.js";

class UserService {
  async listUsers() {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        loginId: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return users;
  }

  async getUserById(id) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        loginId: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return user;
  }

  async createUser(data) {
    const { name, loginId, email, password, role } = data;

    // Check for existing user
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ loginId }, { email }] },
    });

    if (existingUser) {
      if (existingUser.loginId === loginId) {
        throw new ApiError(409, "Login ID already exists");
      }
      if (existingUser.email === email) {
        throw new ApiError(409, "Email already exists");
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        loginId,
        email,
        passwordHash: hashedPassword,
        role,
      },
      select: {
        id: true,
        name: true,
        loginId: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async updateUser(id, data) {
    await this.getUserById(id);

    const { name, loginId, email, password, role } = data;

    // Check if loginId or email is being changed and if it conflicts
    if (loginId || email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [loginId ? { loginId } : {}, email ? { email } : {}].filter(
                (obj) => Object.keys(obj).length > 0,
              ),
            },
          ],
        },
      });

      if (existingUser) {
        if (loginId && existingUser.loginId === loginId) {
          throw new ApiError(409, "Login ID already exists");
        }
        if (email && existingUser.email === email) {
          throw new ApiError(409, "Email already exists");
        }
      }
    }

    const updateData = {
      ...(name && { name }),
      ...(loginId && { loginId }),
      ...(email && { email }),
      ...(role && { role }),
    };

    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        loginId: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async deleteUser(id) {
    await this.getUserById(id);
    await prisma.user.delete({ where: { id } });
  }
}

export const userService = new UserService();
