const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");

const UserModel = require("../../models/User");

// @route   GET api/auth
// @desc    Test route
// @access  Public
router.get("/", auth, async (req, res) => {
  try {
    const user = await UserModel.User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

//@route    POST api/auth
//@desc     User Login
//@access   Public
router.post(
  "/",
  [
    check("email", "enter a valid email address").isEmail(),
    check("password", "Password is mandatory").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await UserModel.User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "invalid credentials" }] });
      }

      //const avatar = gravatar.url(email, { s: "200", r: "pg", d: "mm" });

      //   user = new User.User({
      //     name,
      //     email,
      //     avatar,
      //     password,
      //   });

      //   const salt = await bcrypt.genSalt(10);
      //   user.password = await bcrypt.hash(password, salt);
      //   console.log(user.password);

      //   await user.save();

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res
          .status(400)
          .json({ errors: [{ msg: "invalid credentials" }] });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (error) {
      console.log(error.message);

      return res.status(500).send("server error");
    }
  }
);

module.exports = router;
