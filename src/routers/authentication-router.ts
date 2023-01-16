import { singInPost, signInGitHubPost } from "@/controllers";
import { validateBody } from "@/middlewares";
import { signInSchema, signInGitHubSchema } from "@/schemas";
import { Router } from "express";

const authenticationRouter = Router();

authenticationRouter.post("/sign-in", validateBody(signInSchema), singInPost);
authenticationRouter.post("/sign-in-github", signInGitHubPost);

export { authenticationRouter };
