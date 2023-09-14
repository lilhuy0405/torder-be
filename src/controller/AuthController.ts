import {UserService} from "../service";
import {Request, Response} from "express";
import {User} from "../entity";
import * as bcrypt from 'bcrypt';
import {AuthenticatedRequest} from "../type";

class AuthController {
  private readonly userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async register(req: Request, res: Response) {
    try {
      const {name, email, password} = req.body
      const user = new User()
      if (!name || !email || !password) {
        return res.status(400).json({
          message: 'Please fill all fields'
        })
      }
      //hash password
      const salt = await bcrypt.genSalt(10)
      const hashPwd = await bcrypt.hash(password, salt)

      user.name = name
      user.email = email
      user.password = hashPwd
      user.role = 'user'

      const newUser = await this.userService.createUser(user)
      res.status(201).json({
        message: 'Register success',
        data: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });

    } catch (err) {
      res.status(500).json({
        message: 'Register failed ' + err.message
      })
    }
  }

  async login(req: Request, res: Response) {
    try {
      const {email, password} = req.body;
      if (!email || !password) {
        return res.status(400).json({
          message: 'Please fill all fields'
        })
      }
      const user = await this.userService.findUserByEmail(email)
      if (!user) {
        return res.status(400).json({
          message: 'Email not found'
        })
      }
      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
        return res.status(400).json({
          message: 'Invalid credentials'
        })
      }
      const token = user.generateJwt()
      res.status(200).json({
        message: 'Login success',
        data: {
          accessToken: token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }
        }
      })

    } catch (err) {
      res.status(500).json({
        message: 'Login failed ' + err.message
      })
    }
  }

  async me(req: AuthenticatedRequest, res: Response) {
    try {
      const loggedInUser = req.user;
      const user = await this.userService.findUserById(loggedInUser.id)
      res.status(200).json({
        message: 'Get user success',
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      })

    } catch (err) {
      res.status(500).json({
        message: 'Get users failed ' + err.message
      })
    }
  }
}

export default AuthController;
