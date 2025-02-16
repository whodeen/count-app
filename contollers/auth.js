import { User } from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const signUp = async (req, res, next) => {
  const { name, surname, email, password } = req.body;
  if(!name || !surname || !email || !password) {
    return res.status(401).json({message: 'Please provide valid credentials'});
  }
  try {
    const isSignedUp = await User.findOne({ email });
    if (isSignedUp) {
      return res.status(400).json({ message: 'Користувач за такою поштою уже зареєстрований', reason: "user" });
    }
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const newUser = new User(
      {name, surname, email, password: hashedPassword}
    );
    await newUser.save();    
    const token = jwt.sign({id: newUser._id}, process.env.SECRET_KEY);
    const { userPassword, ...other } = newUser._doc;
    return res.status(200).json({
      token,
      user: other,
      message: "Користувача створено успішно"
    })
  } catch(err) {
    return res.status(404).json({ message: "Щось пішло не так"});
  }
}

export const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if(!email || !password) {
      return res.status(400).json({ message: 'Заповніть форму', reason: "email"});
    }
    const user = await User.findOne({ email });
    if(!user) {
      return res.status(401).json({ message: 'Користувача з такою поштою не існує', reason: "user"});
    }
    const checkPassword = bcrypt.compareSync(password, user.password);
    if(!checkPassword) {
      return res.status(401).json({ message: 'Неправильний пароль', reason: "password"});
    }
    const token = jwt.sign({id: user._id, }, process.env.SECRET_KEY);
    const { password:_, ...other } = user._doc;
    res.status(200).json({user: other, token});
  } catch(error) {
    next(error);
    console.log(error);
  }
}

export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json({users, message: 'Отримання користувачів.'});
  } catch(error) {
    console.log(error);
    res.status(500).json({message: 'Щось пішло не так.'});
  }
}
export const promoteUser = async (req, res) => {
  const { id } = req.params;
  try {
    console.log(res.isAdmin);
    if(!req.isAdmin) {
      return res.status(403).json({ message: "У вам недостатньо прав."})
    }
    const user = await User.findById(id);
    if(!user) {
      return res.status(404).json({ message: 'Користувач не знайдений.'});
    }
    user.status = 'teacher';
    await user.save();
    return res.status(200).json({ message: "Користувача підвищено успішно."})
  } catch(err) {
    return res.status(500).json({ message: 'Щось пішло не так.'});
  }
}
export const lowerUser = async (req, res) => {
  const { id } = req.params;
  try {
    if(!req.isAdmin) {
      return res.status(403).json({ message: "У вам недостатньо прав."})
    }
    const user = await User.findById(id);
    if(!user) {
      return res.status(404).json({ message: 'Користувач не знайдений.'});
    }
    user.status = 'viewer';
    await user.save();
    return res.status(200).json({ message: "Користувача понижено успішно."})
  } catch(err) {
    return res.status(500).json({ message: 'Щось пішло не так.'});
  }
}

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    if(!req.isAdmin) {
      return res.status(403).json({ message: "У вам недостатньо прав."})
    }
    const user = await User.findById(id);
    if(!user) {
      return res.status(404).json({ message: 'Користувач не знайдений.'});
    }
    await User.findByIdAndDelete(id);
    return res.status(200).json({ message: "Користувача видалено успішно."})
  } catch(err) {
    console.log(err)
    return res.status(500).json({ message: 'Щось пішло не так.'});
  }
}