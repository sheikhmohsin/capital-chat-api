let express = require('express');
let router = express.Router();
const passport = require('passport');
const userController = require('../controllers/user-controller')
const verify = require('../middlewares/auth');

router.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/auth/google/redirect', function(req, res, next) {
    passport.authenticate('google', function(err, user, info) {
        console.log("sdkvns", user)
        res.render('token', {token: user.token});
    })(req, res, next);
});

router.post('/signup', (req, res, next) => {
    let controller = userController();
    controller.signup(req, res, next);
})

router.post('/login', (req, res, next) => {
    let controller = userController();
    controller.login(req, res, next);
})

router.get('/logout', (req, res, next) => {
    let controller = userController();
    controller.logout(req, res, next);
})

module.exports = router;