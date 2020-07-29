import React from "react";
import { generateQueryString } from "./helper";

/**
 * The customizable attributes of the AppleLogin button.
 */
export interface AppleDesignProp {
  /**
   * The height of the button image.
   * The minimum and maximum values are 30 and 64,
   * respectively, and the default value is 30.
   */
  height?: number;
  /**
   * The width of the button image.
   * The minimum and maximum values are 130 and 375,
   * respectively, and the default value is 140.
   */
  width?: number;
  /**
   * The background color for the button image.
   * The possible values are white and black (the default).
   */
  color?: "white" | "black";
  /**
   * A Boolean value that determines whether the button image has a border.
   * The default value is false.
   */
  border?: boolean;
  /**
   * The type of button image returned.
   * The possible values are sign-in (the default) and continue.
   */
  type?: "sign-in" | "continue";
  /**
   * The corner radius for the button image.
   * The minimum and maximum values are 0 and 50,
   * respectively, and the default value is 15.
   */
  border_radius?: number;
  /**
   * The scale of the button image.
   * The minimum and maximum values are 1 and 6,
   * respectively, and the default value is 1.
   */
  scale?: number;
  /** The language used for text on the button. The default is en_US. */
  locale?: "ar_SA" | "ca_ES" | "cs_CZ" | "da_DK" | "de_DE" | "el_GR" | "en_GB" |
    "en_US" | "es_ES" | "es_MX" | "fi_FI" | "fr_CA" | "fr_FR" | "hr_HR" |
    "hu_HU" | "id_ID" | "it_IT" | "iw_IL" | "ja_JP" | "ko_KR" | "ms_MY" |
    "nl_NL" | "no_NO" | "pl_PL" | "pt_BR" | "pt_PT" | "ro_RO" | "ru_RU" |
    "sk_SK" | "sv_SE" | "th_TH" | "tr_TR" | "uk_UA" | "vi_VI" | "zh_CN" |
    "zh_HK" | "zh_TW";
}

export interface AppleLoginProps {
  /** The developer’s client identifier, as provided by WWDR. */
  clientId: string;
  /** The URI to which the authorization redirects. */
  redirectURI: string;
  /**
   * The amount of user information requested from Apple.
   * Valid values are name and email. You can request one, both, or none.
   */
  scope?: string;
  /** The current state of the request. */
  state?: string;
  /**
   * The type of response requested. Valid values are code and id_token.
   * You can request one or both. When requesting an id_token response type,
   * response_mode must be either fragment or form_post.
   */
  responseType?: "code" | "id_token";
  /**
   * The type of response mode expected.
   * Valid values are query, fragment, and form_post.
   * If you requested any scopes, the value must be form_post.
   */
  responseMode?: "query" | "fragment" | "form_post" | "web_message";
  /**
   * A String value used to associate a client session with an ID token.
   * This value is also used to mitigate replay attacks.
   */
  nonce?: string;
  usePopup?: boolean;
  /**
   * The customizable attributes of the AppleLogin button.
   * @see {@link https://developer.apple.com/documentation/signinwithapplejs/incorporating_sign_in_with_apple_into_other_platforms|Apple Docs} for further information.
   * @example querystring "https://appleid.apple.com/auth/authorize?client_id=com.youngagency.young.web&redirect_uri=https%3A%2F%2Fdocs.youngplatform.com%2Fsignwithapple&response_type=code%20id_token&state=a63550ed-20d9-4148-ac37-524d66dfcfcc&scope=name%20email&response_mode=web_message&frame_id=1283fcc6-b322-4306-a819-ef2556d566ba&m=12&v=1.5.2"
   */
  designProp?: AppleDesignProp;
  /** Function to call when the request has succeeded. */
  onSuccess?: (d: any) => void;
  /** Function to call when the request has failed. */
  onFailure?: (d: any) => void;
  /** Render prop to use a custom element, use renderProps.onClick. */
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
    usePopup = false,
    ...rest
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
    <div id="appleid-signin" onClick={onClick} {...rest}>
      <img
        src={`https://appleid.cdn-apple.com/appleid/button?${generateQueryString(
          designProp
        )}`}
      />
    </div>
  );
};

export default AppleLogin;
