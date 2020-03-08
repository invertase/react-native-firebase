export interface Account {
  user: User;
  tokens: Tokens;
}

interface User {
  iss: string;
  azp: string;
  aud: string;
  sub: string;
  hd: string;
  email: string;
  email_verified: boolean;
  at_hash: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  locale: string;
  iat: number;
  exp: number;
}

interface Tokens {
  access_token: string;
  scope: string;
  token_type: string;
  id_token: string;
  expiry_date: number;
  scopes: string[];
}
