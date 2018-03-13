let express = require('express');
let router = express.Router();
const passport = require('passport');
const userController = require('../controllers/user-controller')
const verify = require('../middlewares/auth');

const requireAuth = passport.authenticate('jwt', {session: false});
const requireSignin = passport.authenticate('local', {session: false});

router.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/auth/google/redirect', function(req, res, next) {
    passport.authenticate('google', function(err, user, info) {
        console.log("sdkvns", user)
        res.render('token', {token: user.token});
    })(req, res, next);
});

router.post('/RegisterUser', (req, res, next) => {
    let controller = userController();
    controller.signup(req, res, next);
})

router.post('/ChangePassword/:id', (req, res, next) => {
    let controller = userController();
    controller.changePassword(req, res, next);
})

router.post('/login', requireSignin, (req, res, next) => {
    console.log("after");
    let controller = userController();
    controller.login(req, res, next);
})

router.get('/logout', requireAuth, (req, res, next) => {
    let controller = userController();
    controller.logout(req, res, next);
})

router.get('/test', requireAuth, (req, res, next) => {
    res.json({user: req.user});
})

module.exports = router;