import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/users.js";

export const signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(404).json({ message: "Invalid username or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordCorrect) {
      return res.status(404).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      "secret",
      { expiresIn: "1h" }
    );

    res.status(200).json({ result: existingUser, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const signUp = async (req, res) => {
  const { email, password, confirmPassword, firstName, lastName } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(404).json({ message: "User already exists" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await User.create({
      email,
      password: hashedPassword,
      name: `${firstName} ${lastName}`,
    });

    const token = jwt.sign({ email: result.email, id: result._id }, "secret", {
      expiresIn: "1h",
    });

    res.status(200).json({ result, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getAllUsers = async (req, res, next) => {
  const users = await User.find();
  if (users) return res.status(200).json({ users });
  else return res.status(200).json({ msg: "No users found" });
};

export const deleteUser = async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findByIdAndDelete(id);
  if (user) return res.status(200).json({ msg: "User deleted" });
  else return res.status(404).json({ msg: "No user found" });
};
export const editUser = async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findById(id);
  
  if (user) {
    const { email, password, name } = req.body;
    
    // Prepare update object
    const updateData = { email , name };
    
    // Only hash and include password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 12);
      updateData.password = hashedPassword;
    }

    if (!email){
      updateData.email = user.email; // Keep existing email, if not available
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }

    );
    
    if (updatedUser) {
      return res.status(200).json({ msg: "User updated" });
    }
  } else {
    return res.status(404).json({ msg: "No user found" });
  }
};
