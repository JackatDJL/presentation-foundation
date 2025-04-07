export interface SearchParams {
  dev?: string;
  shortname?: string;
  [key: string]: string | string[] | undefined;
}

export const forbiddenShortnames = ["auth", "clerk", "api", "www", "analytics"];
