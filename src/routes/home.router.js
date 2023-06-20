import express from "express"
import passport from "passport";
const homeRouter = express.Router()

const privateRoute = (req, res, next) => {
  if (req.session.user) {
      next();
  } else {
      res.redirect('/login');
  }
};

const publicRoute = (req, res, next) => {
  if (!req.session.user) {
      next();
  } else {
      res.redirect('/profile');
  }
};


homeRouter.post('/register', passport.authenticate('register',{successRedirect: '/profile',failureRedirect: '/',
failureFlash: true}), async(req,res)=>{
  res.redirect('/login');
})

homeRouter.post('/login', passport.authenticate('login', {failureRedirect: '/login'}),async (req, res) => {
        if(!req.user) return res.status(400).send({status: "error", error: "Credenciales incorrectas"})
        req.session.user = req.user;
        res.redirect('/products');
    }
);
homeRouter.get('/login', publicRoute, (req, res) => {
  res.render('login');
});

homeRouter.get('/github', passport.authenticate('github',{scope:['user:email']}), async(req,res)=>{})

homeRouter.get('/githubcallback', passport.authenticate('github',{failureRedirect: '/login'}), async (req, res) => {
  if(!req.user) return res.status(400).send({status: "error", error: "Credenciales incorrectas"})
  req.session.user = req.user;
  res.redirect('/products');
})

homeRouter.get('/profile', privateRoute, (req, res) => {
  if (!req.session.user) {
      res.redirect('/login');
  } else {
      const { first_name, last_name, email, age } = req.session.user;
      res.render('profile', { first_name, last_name, email, age });
  }
});

homeRouter.get('/logout', privateRoute, (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

homeRouter.get('/', (req,res)=>{
  res.render('home')
})
export default homeRouter