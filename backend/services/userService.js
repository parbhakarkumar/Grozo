import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const registerUserService = async ({ name, email, password }) => {
  const existUser = await userModel.findOne({ email });
  if (existUser) {
    const error = new Error("An account with this email already exists. Please log in.");
    error.statusCode = 409;
    throw error;
  }

  if (!validator.isEmail(email)) {
    const error = new Error("Please provide a valid email address.");
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 8) {
    const error = new Error("Password must be at least 8 characters long.");
    error.statusCode = 400;
    throw error;
  }

  const salt = await bcrypt.genSalt(12);
  const hashPassword = await bcrypt.hash(password, salt);

  const newUser = await userModel.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hashPassword,
  });

  const token = createToken(newUser._id);

  return {
    token,
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
  };
};

export const loginUserService = async ({ email, password }) => {
  const user = await userModel.findOne({ email }).select("+password");

  if (!user) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error("This account has been deactivated. Please contact support.");
    error.statusCode = 403;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  await userModel.findByIdAndUpdate(user._id, { lastLogin: new Date() });

  const token = createToken(user._id);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

export const adminLoginService = async ({ email, password }) => {
  if (
    email !== process.env.ADMIN_EMAIL ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    const error = new Error("Invalid admin credentials.");
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(email + password, process.env.JWT_SECRET);

  return { token };
};

export const googleAuthService = async ({ credential, email: bodyEmail, name: bodyName, picture: bodyPicture, googleId: bodyGoogleId }) => {
  let email = bodyEmail;
  let name = bodyName;
  let picture = bodyPicture;
  let googleId = bodyGoogleId;

  if (credential) {
    try {
      const base64Url = credential.split(".")[1];
      if (base64Url) {
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        const payload = JSON.parse(jsonPayload);
        email = payload.email || email;
        name = payload.name || payload.given_name || name;
        picture = payload.picture || picture;
        googleId = payload.sub || googleId;
      }
    } catch (decodeErr) {
      console.warn("Google credential decode note:", decodeErr.message);
    }
  }

  if (!email) {
    const error = new Error("Google authentication failed. Email not provided.");
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.toLowerCase().trim();
  let user = await userModel.findOne({ email: normalizedEmail });

  if (user) {
    if (!user.isActive) {
      const error = new Error("This account has been deactivated. Please contact support.");
      error.statusCode = 403;
      throw error;
    }

    const updates = { lastLogin: new Date() };
    if (googleId && !user.googleId) updates.googleId = googleId;
    if (picture && !user.avatar) updates.avatar = picture;
    if (name && !user.name) updates.name = name;

    user = await userModel.findByIdAndUpdate(user._id, updates, { new: true });
  } else {
    user = await userModel.create({
      name: name ? name.trim() : normalizedEmail.split("@")[0],
      email: normalizedEmail,
      googleId: googleId || `google_${Date.now()}`,
      avatar: picture || "",
      role: "user",
      lastLogin: new Date(),
    });
  }

  const token = createToken(user._id);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  };
};
