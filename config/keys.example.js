module.exports = {
  google: {
      clientID: '871339931328-jk9ge3rkb9fjgon5dtpnu2hsk8a2m5dl.apps.googleusercontent.com',
      clientSecret: 'LW2F5kzmcDdt9vUdGeuknMpb'
  },
  mongodb: {
      dbURI: `mongodb://localhost:27017/Capital`,
  },
  session: {
      secret: 'SecretKeyForCapitalChatForEncyrpt'
  },
  jwt: {
      secret: 'SecretKeyForJWTForEncyrpt',
      expiresIn: 7 * 60 * 60
  }
}