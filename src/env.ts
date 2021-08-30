import { cleanEnv, makeValidator, str, url } from "envalid";

type NodeEnv = "development" | "production" | "test";

const nodeEnv = makeValidator(x => str({ choices: ["development", "test", "production"] })._parse(x) as NodeEnv);

// remove REACT_APP_ prefix
const renamedEnv = Object.entries(process.env).reduce((obj, [k, v]) => {
    k = k.replace(/^REACT_APP_/i, "");
    obj[k] = v;
    return obj;
}, {} as Record<string, any>);

const env = cleanEnv(renamedEnv, {
    NODE_ENV: nodeEnv({ default: "development" }),
    WS_URL: url(),
});

export default env;
