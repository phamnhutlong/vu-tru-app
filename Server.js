const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

/* ===== CONFIG ===== */
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

/* ===== MIDDLEWARE ===== */
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

/* ===== CONNECT MONGODB ===== */
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Kết nối MongoDB Atlas thành công"))
  .catch((err) => console.log("❌ Lỗi MongoDB:", err));

/* ===== ROOT ROUTE ===== */
app.get("/", (req, res) => {
  res.send("🚀 Server is running successfully!");
});

/* ===== SCHEMA ===== */
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  active: { type: Boolean, default: true },
});

const User = mongoose.model("User", UserSchema);

/* ===== REGISTER ===== */
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    res.json({ message: "Đăng ký thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

/* ===== LOGIN ===== */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(400).json({ message: "Sai thông tin" });
    }

    if (!user.active) {
      return res.status(400).json({ message: "Tài khoản đã bị xóa" });
    }

    res.json({ message: "Đăng nhập thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

/* ===== GET USERS ===== */
app.get("/users", async (req, res) => {
  try {
    const users = await User.find({ active: true });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

/* ===== DELETE USER ===== */
app.delete("/delete/:id", async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { active: false });
    res.json({ message: "Đã xóa tài khoản" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

/* ===== START SERVER ===== */
app.listen(PORT, () => {
  console.log(`🚀 Server chạy trên port ${PORT}`);
});
