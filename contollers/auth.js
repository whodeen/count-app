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