import React from "react";
import { generateQueryString } from "./helper";

export interface AppleLoginProps {
  clientId: string;
  redirectURI: string;
  scope?: string;
  state?: string;
  responseType?: string | "code" | "id_token";
  responseMode?: string | "query" | "fragment" | "form_post" | "web_message";
  nonce?: string;
  usePopup?: boolean;
  designProp?: {
    // REF: https://developer.apple.com/documentation/signinwithapplejs/incorporating_sign_in_with_apple_into_other_platforms
    // https://appleid.apple.com/auth/authorize?client_id=com.youngagency.young.web&redirect_uri=https%3A%2F%2Fdocs.youngplatform.com%2Fsignwithapple&response_type=code%20id_token&state=a63550ed-20d9-4148-ac37-524d66dfcfcc&scope=name%20email&response_mode=web_message&frame_id=1283fcc6-b322-4306-a819-ef2556d566ba&m=12&v=1.5.2
    height?: number;
    width?: number;
    color?: string | "white" | "black";
    border?: boolean;
    type?: string | "sign-in" | "continue";
    border_radius?: number;
    scale?: number;
    locale?: string;
  };
  onSuccess?: (d: any) => void;
  onFailure?: (d: any) => void;
  render?: (props: {
    onClick: (e?: any) => void;
    disabled?: boolean;
  }) => JSX.Element;
}

const AppleLogin = (props: AppleLoginProps) => {
  const {
    clientId,
    redirectURI,
    state = "",
    render,
    designProp = {},
    responseMode = "query",
    responseType = "code",
    nonce,
    onSuccess = () => {},
    onFailure = () => {},
    scope,
    usePopup = false
  } = props;

  const onClick = (e: any = null) => {
    if (e) {
      e.preventDefault();
    }

    var url = `https://appleid.apple.com/auth/authorize?${generateQueryString(
      {
        response_type: responseType,
        response_mode: responseMode,
        client_id: clientId,
        redirect_uri: encodeURIComponent(redirectURI),
        state,
        nonce,
        scope: responseMode === "query" ? "" : scope
      }
    )}`;
    
    if (!usePopup) {
      window.location.href = url;
    }

    const newwindow = window.open(url,"Stepdrop - Apple Sign In","width=700,height=699,toolbar=0,menubar=0,location=0"); 
    if(newwindow != null) newwindow.focus();

    window.addEventListener("message", function(message) {
      if (message.origin != "https://appleid.apple.com") { return; }

      var json = JSON.parse(message.data);

      if(json["method"] !== "oauthDone") { return; }

      if(newwindow !== null)
        newwindow.close();

      if(json["data"]["error"] !== undefined) {
        onFailure(json["data"]["error"]);
        return;
      }

      var firstName = "";
      var lastName = "";

      if(json["data"]["user"] !== undefined) {
        firstName = json["data"]["user"]["name"]["firstName"] === undefined ? "" : json["data"]["user"]["name"]["firstName"];
        lastName = json["data"]["user"]["name"]["lastName"] === undefined ? "" : json["data"]["user"]["name"]["lastName"];
      }

      onSuccess({
        "code": json["data"]["authorization"]["code"] === undefined ? "" : json["data"]["authorization"]["code"],
        "firstName": firstName,
        "lastName": lastName
      });
    }, false);
  };

  if (typeof render === "function") {
    return render({ onClick });
  }

  return (
    <div id="appleid-signin" onClick={onClick}>
      <img
        src={`https://appleid.cdn-apple.com/appleid/button?${generateQueryString(
          designProp
        )}`}
      />
    </div>
  );
};

export default AppleLogin;
