const development = {
  db: {
    url: `mongodb://localhost:27017/Capital`,
  },
  content: {
    url: `http://localhost:9090/`
  }
};

const production = {};

const staging = {};

const testing = {
  db: {
    url: `mongodb://localhost:27017/Capital`,
  },
  content: {
    url: `http://34.230.42.132:9090/`
  }
};

function getEnvvars() {
  switch (process.env.NODE_ENV) {
    case 'production':
      return production;
      break;
    case 'staging':
      return staging;
      break;
    case 'testing':
      return testing;
      break;
    default:
      return development;
  }
}

module.exports = getEnvvars();