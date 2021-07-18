const express = require("express");
const router = express.Router();

/* GET /change-locale/:locale */
router.get("/:locale", function (req, res, next) {
  // cookie with the language they ask
  const locale = req.params.locale;

  // maxAge is in ms -> I put 20 days.
  res.cookie("nodepop-locale", locale, { maxAge: 1000 * 60 * 60 * 24 * 20 });

  // redirect to the page is coming
  res.redirect(req.get("referer"));
});

module.exports = router;
