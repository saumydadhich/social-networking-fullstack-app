const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");

const ProfileModel = require("../../models/Profile");
const UserModel = require("../../models/User");

// @route   GET api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await ProfileModel.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);

    if (!profile) {
      return res.status(400).json({ errors: [{ msg: "No such profile" }] });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

module.exports = router;
