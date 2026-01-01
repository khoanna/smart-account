import { initiateLogin, getSocialValidator, logout, isAuthorized } from "@botanary/social-validator";
import { entryPoint, kernelVersion, publicClient } from "../../utils/constant";
import { createKernelAccount } from "@botanary/sdk";
import { type AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export async function checkIsLoggedInSocial(): Promise<boolean> {
  const isUserLoggedIn = await isAuthorized({ magicPublishKey: process.env.NEXT_PUBLIC_MAGIC_PUBLIC_KEY! });
  return isUserLoggedIn;
}

export async function loginWithSocial(route: AppRouterInstance): Promise<typeof kernelAccount | void> {
  const isUserLoggedIn = await checkIsLoggedInSocial();

  if (!isUserLoggedIn) {
    await initiateLogin({
      socialProvider: "google",
      oauthCallbackUrl: `${window.location.origin}/dashboard`,
      magicPublishKey: process.env.NEXT_PUBLIC_MAGIC_PUBLIC_KEY!,
    });
    return;
  }

  const socialValidator = await getSocialValidator(publicClient, {
    entryPoint,
    kernelVersion,
    magicPublishKey: process.env.NEXT_PUBLIC_MAGIC_PUBLIC_KEY!,
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
