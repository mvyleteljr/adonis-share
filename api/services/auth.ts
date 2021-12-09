import User from 'App/Models/User'

const passportJWT = require('passport-jwt')

const JWTStrategy = passportJWT.Strategy
const ExtractJWT = passportJWT.ExtractJwt

module.exports = (passport) => {
  const options = {
    jwtFromRequest: ExtractJWT.fromAuthHeaderWithScheme('JWT'),
    secretOrKey: process.env.JWT_SECRET_KEY,
  }
  passport.use(
    new JWTStrategy(options, async (jwtPayload, done) => {
      const user = await User.findBy('address', jwtPayload.address)
      if (user) {
        return done('invalid user')
      } else {
        return done(null, {})
      }
    })
  )
}
