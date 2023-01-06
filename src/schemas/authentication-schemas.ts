import { SignInParams, SignInGitHub } from "@/services";
import Joi from "joi";

export const signInSchema = Joi.object<SignInParams>({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const signInGitHubSchema = Joi.object<SignInGitHub>({
  email: Joi.string().email().required(),
  accessToken: Joi.string().required(),
  username: Joi.string().required()
});
