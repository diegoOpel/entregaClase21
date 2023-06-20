import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { createHash, isValidPassword } from '../utils.js';
import {usersModel} from '../dao/models/users.model.js'
import GitHubStrategy from 'passport-github2'
const initializePassport = () => {
  passport.use('register', new LocalStrategy(
    { passReqToCallback:true, usernameField: 'email' },
    async (req, username, password, done) => {
      
      console.log(req)
      const {first_name, last_name, age} = req.body

      try {
        const user = await usersModel.findOne({ email: username });
        if (user) {
          return done(null, false, { message: 'Correo electrónico incorrecto.' });
        }

        const newUser = {
          first_name, 
          last_name, 
          email: username, 
          age, 
          password: createHash(password)
        }

        const result = await usersModel.create(newUser)

        return done(null, result);
      } catch (error) {
        return done(error);
      }
    }
    
  ));
  
  passport.use('github', new GitHubStrategy({
    clientID: 'Iv1.3c06042e533aff68',
    clientSecret: '837f17a347349b935d2180325eab5ca0468d763c',
    callbackURL:'http://localhost:8080/githubcallback'
  }, async(accessToken, refreshToken, profile, done)=>{
    try{
      console.log(profile);
      let user = usersModel.findOne({email: profile._json.email});
      if(!user){
        let newUser = {
          first_name: profile._json.name,
          last_name: '',
          age: 18,
          email: profile._json.email,
          password: ''
        }
        let result = await usersModel.create(newUser);
        return done(null,result);
      }else{
        return done(null,user);
      }
    }catch(error){
      return done(error)
    }
  }))

  passport.use('login',new LocalStrategy(
    { usernameField: 'email' },
      async (email, password, done) => {
        try {
          const user = await usersModel.findOne({ email });
          if (!user) {
            return done(null, false, { message: 'Correo electrónico incorrecto.' });
          }
          
          const passwordMatch = isValidPassword(user, password);
          if (!passwordMatch) {
            return done(null, false, { message: 'Contraseña incorrecta.' });
          }
  
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    ))

    
  passport.serializeUser((user, done) => {
    console.log(user)
    done(null, user._id);
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await usersModel.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  
}
export default initializePassport