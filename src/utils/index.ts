import { Auth } from "aws-amplify";

export async function currentAuthenticatedUser() {
  try {
    const user = await Auth.currentAuthenticatedUser({
      bypassCache: false, // Optional, By default is false. If set to true, this call will send a request to Cognito to get the latest user data
    });
    return user;
  } catch (err) {
    console.log(err);
  }
}
