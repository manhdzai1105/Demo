const errorHandle = require("../middlewares/error.handle");
const accountRouter = require("./account.router");

module.exports = (app) => {
  app.use("/api/account", accountRouter);
  app.use(errorHandle);
};
