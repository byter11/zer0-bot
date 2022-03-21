import nodeFetch from "node-fetch";
import fetchCookie from "fetch-cookie";

export default class ValorantAPI {
  private fetch;
  public AuthTimestamp = 0;

  private headers: any = {
    Accept: "*/*",
    "Accept-Encoding": "gzip, deflate, br",
    Connection: "keep-alive",
    "Content-Type": "application/json; charset=UTF-8",
    "X-Riot-ClientPlatform":
      "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9",
  };

  constructor(
    private credentials: { user: string; pass: string },
    private region = "eu"
  ) {
    if (!region) region = "eu";
    this.fetch = fetchCookie(nodeFetch);
  }

  private async authCookies() {
    return this.fetch("https://auth.riotgames.com/api/v1/authorization/", {
      method: "POST",
      headers: this.headers,
      body: `{"client_id":"play-valorant-web-prod","nonce":"1","redirect_uri":"https://playvalorant.com/opt_in","response_type":"token id_token"}`,
    }).then((res) => console.log("cookies: ", res.status));
  }

  private async authRequest() {
    const { user, pass } = this.credentials;

    return this.fetch("https://auth.riotgames.com/api/v1/authorization/", {
      method: "PUT",
      headers: this.headers,
      body: `{
        "type": "auth",
        "username": "${user}",
        "password": "${pass}",
        "remember": true,
        "language": "en_US"
        }`,
    })
      .then((res) => {
        console.log("auth: ", res.status);
        return res.json();
      })
      .then((res: any) => {
        const uri = res.response.parameters.uri as string;
        const values = uri
          .replace("https://playvalorant.com/opt_in#", "")
          .split("&");
        const accessToken = values
          .map((val) => val.split("="))
          .filter(([key, val]) => key == "access_token")[0][1];
        this.headers["Authorization"] = `Bearer ${accessToken}`;
        return accessToken;
      });
  }

  private async reAuth() {
    this.fetch(
      "https://auth.riotgames.com/authorize?redirect_uri=https%3A%2F%2Fplayvalorant.com%2Fopt_in&client_id=play-valorant-web-prod&response_type=token%20id_token&nonce=1",
      {
        method: "GET",
        redirect: "follow",
      }
    ).then((res) => {
      console.log("reAuth: ", res.url);
    });
  }

  private async entitlement() {
    return this.fetch("https://entitlements.auth.riotgames.com/api/token/v1", {
      method: "POST",
      headers: {
        ...this.headers,
      },
    })
      .then((res) => {
        console.log("entitlement: ", res.status);
        return res.json();
      })
      .then((res: any) => {
        this.headers["X-Riot-Entitlements-JWT"] = res.entitlements_token;
      });
  }

  private async playerInfo() {
    return this.fetch("https://auth.riotgames.com/userinfo", {
      headers: this.headers,
    })
      .then((res) => {
        console.log("playerInfo: ", res.status);
        return res.json();
      })
      .then((res: any) => {
        return res.sub;
      });
  }

  public async clientVersion(puuid: string) {
    // console.log(this.headers)
    return this.fetch(
      `https://glz-${this.region}-1.${this.region}.a.pvp.net/session/v1/sessions/${puuid}/`,
      {
        method: "GET",
        headers: this.headers,
      }
    ).then((res) => {
      console.log("clientVersion", res.status);
    });
  }

  public async matchHistory(puuid: string): Promise<Match | any> {
    return this.fetch(
      `https://pd.${this.region}.a.pvp.net/match-history/v1/history/${puuid}?queue=competitive`,
      {
        method: "GET",
        headers: this.headers,
      }
    )
      .then((res) => {
        console.log("matchHistory: ", res.status);
        return res.json();
      })
      .catch((e) => console.log(e));
  }

  public async matchDetails(matchId: string): Promise<MatchDetails | any> {
    return this.fetch(
      `https://pd.${this.region}.a.pvp.net/match-details/v1/matches/${matchId}`,
      {
        method: "GET",
        headers: this.headers,
      }
    ).then((res) => {
      console.log("matchDetails: ", res.status);
      return res.json();
    });
  }

  public async connect() {
    this.AuthTimestamp = Date.now();
    return this.authCookies()
      .then(() => this.authRequest())
      .then(() => this.entitlement())
      .then(() => this.playerInfo())
      .then((userId) => userId)
      .catch((e) => {});
    // this.clientVersion(userId)
  }
}
