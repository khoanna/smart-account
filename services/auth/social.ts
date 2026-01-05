import { initiateLogin, getSocialValidator, logout, isAuthorized } from "@zerodev/social-validator";
import { entryPoint, kernelVersion, publicClient } from "../../utils/constant";
import { createKernelAccount } from "@zerodev/sdk";
import { type AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export async function checkIsLoggedInSocial(): Promise<boolean> {
  const isUserLoggedIn = await isAuthorized({ projectId: process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID! });
  return isUserLoggedIn;
}

export async function loginWithSocial(route: AppRouterInstance): Promise<typeof kernelAccount | void> {
  const isUserLoggedIn = await checkIsLoggedInSocial();

  if (!isUserLoggedIn) {
    await initiateLogin({
      socialProvider: "google",
      oauthCallbackUrl: `${window.location.origin}/dashboard`,
      projectId: process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID!,
    });
    return;
  }

  const socialValidator = await getSocialValidator(publicClient, {
    entryPoint,
    kernelVersion,
    projectId: process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID!,
  });

  const kernelAccount = await createKernelAccount(publicClient, {
    plugins: {
      sudo: socialValidator,
    },
    entryPoint,
    kernelVersion,
  });

  route.push("/dashboard");
  localStorage.setItem("type", "social");
  localStorage.setItem("kernelAccountAddress", JSON.stringify(kernelAccount.address));
  return kernelAccount;
}
