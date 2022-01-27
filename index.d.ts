import { ApplicationFunction } from "probot";

declare function run(
  probotApp: ApplicationFunction | ApplicationFunction[]
): Promise<void>;

export default run;
