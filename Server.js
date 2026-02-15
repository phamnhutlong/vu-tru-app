const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // cho phép mở file html

mongoose
  .connect("mongodb://127.0.0.1:27017/userDB")
  .then(() => console.log("Kết nối MongoDB thành công"))
  .catch((err) => console.log("Lỗi MongoDB:", err));

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  active: { type: Boolean, default: true },
});

const User = mongoose.model("User", UserSchema);

/* ĐĂNG KÝ */
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const exist = await User.findOne({ email });
  if (exist) return res.status(400).json({ message: "Email đã tồn tại" });

  const newUser = new User({ name, email, password });
  await newUser.save();

  res.json({ message: "Đăng ký thành công" });
});

/* ĐĂNG NHẬP */
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.status(400).json({ message: "Sai thông tin" });
  if (!user.active)
    return res.status(400).json({ message: "Tài khoản đã bị xóa" });
  if (user.password !== password)
    return res.status(400).json({ message: "Sai thông tin" });

  res.json({ message: "Đăng nhập thành công" });
});

/* LẤY DANH SÁCH */
app.get("/users", async (req, res) => {
  const users = await User.find({ active: true });
  res.json(users);
});

/* XÓA TÀI KHOẢN */
app.delete("/delete/:id", async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { active: false });
  res.json({ message: "Đã xóa tài khoản" });
});

app.listen(3000, () => {
  console.log("Server chạy tại http://localhost:3000");
});
