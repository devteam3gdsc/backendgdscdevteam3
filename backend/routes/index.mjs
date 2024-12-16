import authrouter from "./auth.mjs";

function router(app) {
  app.use("/auth", authrouter);
}
export default router;
