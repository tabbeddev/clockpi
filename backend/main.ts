#!/usr/bin/deno -NRWE
// deno-lint-ignore-file no-case-declarations
import { existsSync } from "jsr:@std/fs/exists";
import { extname } from "jsr:@std/path";
import { contentType } from "jsr:@std/media-types";

let SIMMODE = Deno.args.includes("simmode");
if (SIMMODE) {
  console.warn(
    "Starting in Simulated Mode! Not all features are truly functional!",
  );
}

function writeConfig(): void {
  Deno.writeTextFileSync(configPath, stfy(config));
}

function syncMedia(): void {
  const media = Deno.readDirSync(mediaPath).toArray().map((e) => e.name);
  for (const client of connectedClients) {
    client.send(stfy({ type: "media", media }));
  }
}

function setDefaultValue(
  config_set: Set<string>,
  key: string,
  value: ConfigEntry,
) {
  if (!config_set.has(key)) {
    config[key] = value;
  }
}

const stfy = JSON.stringify;
const prse = JSON.parse;

enum RequestType {
  Brightness = "brightness",
  BacklightPower = "bl-power",

  GetConfigs = "get-configs",
  SetConfigs = "set-configs",
}

interface Request {
  type: RequestType;

  // Generic
  data: string;

  // BacklightPower
  enabled: boolean;

  // Config
  config_keys: string[];
  config: Record<string, string>;
}

const homeDir = Deno.env.get("HOME");
const configPath = homeDir + "/.config/clockpi2.backend.json";
const mediaPath = homeDir + "/.local/share/clockpi2/media/";

const connectedClients: WebSocket[] = [];

Deno.mkdirSync(mediaPath, { recursive: true });

let backlight_path: string;
try {
  backlight_path = `/sys/class/backlight/${
    Deno.readDirSync("/sys/class/backlight").toArray()[0].name
  }/`;
} catch {
  backlight_path = "";
  console.warn("No Backlight Device found! Using Simmode!");

  SIMMODE = true;
}

type ConfigEntry = string | boolean | string[];
type Config = Record<string, ConfigEntry>;

let config: Config;
if (existsSync(configPath)) {
  config = prse(Deno.readTextFileSync(configPath));
} else {
  Deno.createSync(configPath);
  config = {};
}
const config_set = new Set(Object.keys(config));
setDefaultValue(config_set, "theme", "blue");
setDefaultValue(config_set, "showSeconds", true);
setDefaultValue(config_set, "alarmRingtone", "Default");
setDefaultValue(config_set, "notiRingtone", "Default");
// Syntax for alarms and notifications
// [{hour: 6, minute: 0, disabled: true, repeat: []}]
// [{hour: 7, minute: 0, disabled: false, repeat: [0, 3, 5, 6]}]
setDefaultValue(config_set, "alarms", []);
setDefaultValue(config_set, "notifications", []);

writeConfig();

Deno.serve({ port: 8109 }, async (req, info) => {
  if (req.headers.get("upgrade") != "websocket") {
    const url = new URL(req.url);
    console.log(
      `[${info.remoteAddr.hostname}] HTTP : ${req.method} - ${url.pathname}`,
    );

    switch (req.method) {
      case "GET":
        try {
          let file_path: string;
          if (url.pathname.startsWith("/media")) {
            file_path = mediaPath + url.pathname.substring(7);
          } else {
            file_path = "/var/clockpi" + url.pathname;
            if (url.pathname == "/") {
              file_path += "/index.html";
            }
          }

          const content = await Deno.readFile(file_path);
          const type = contentType(extname(file_path));
          if (!type) {
            return new Response("400 Invalid File Path", { status: 400 });
          }

          return new Response(content, { headers: { "Content-Type": type } });
        } catch {
          return new Response("404 Not Found", { status: 404 });
        }

      case "PUT":
      case "POST":
        const path = url.pathname.substring(1);
        if (!path) {
          return new Response("400 Missing Path", { status: 400 });
        }
        if (path == "Default") {
          return new Response("403 This filename is reserved", { status: 403 });
        }
        const file_path = mediaPath + path;
        if (existsSync(file_path) && req.method == "POST") {
          return new Response("409 Conflict", { status: 409 });
        }

        try {
          await Deno.writeFile(file_path, await req.bytes());
          syncMedia();
          return new Response("201 Created", { status: 201 });
        } catch {
          return new Response("500 Internal Server Error", { status: 500 });
        }

      case "DELETE":
        const path2 = url.pathname.substring(1);
        if (!path2) {
          return new Response("400 Missing Path", { status: 400 });
        }
        const file_path2 = mediaPath + path2;
        if (!existsSync(file_path2)) {
          return new Response("409 Conflict", { status: 409 });
        }

        try {
          await Deno.remove(file_path2);
          syncMedia();
          return new Response("200 Deleted", { status: 200 });
        } catch {
          return new Response("500 Internal Server Error", { status: 500 });
        }

      default:
        return new Response("501 Unsupported Method", { status: 501 });
    }
  }
  const { socket, response } = Deno.upgradeWebSocket(req);

  socket.onopen = () => {
    console.log(`[${info.remoteAddr.hostname}] WS : Connected`);
    connectedClients.push(socket);
  };

  socket.onclose = () => {
    console.log(`[${info.remoteAddr.hostname}] WS : Disconnected`);
    connectedClients.toSpliced(connectedClients.indexOf(socket), 1);
  };

  socket.onmessage = (ev) => {
    console.log(`[${info.remoteAddr.hostname}] WS : Message (${ev.data})`);

    let json: Request;
    try {
      json = prse(ev.data);
    } catch {
      return socket.send(stfy({ type: "exception", msg: "JSON parse error" }));
    }

    switch (json.type) {
      case RequestType.BacklightPower:
        if (SIMMODE) {
          console.log(`SIMULATING BL_POWER: ${json.enabled ? "0" : "1"}`);
        } else {
          Deno.writeTextFileSync(
            backlight_path + "bl_power",
            json.enabled ? "0" : "1",
          );
        }
        break;

      case RequestType.Brightness:
        if (SIMMODE) {
          console.log(`SIMULATING BRIGHTNESS: ${json.data}`);
        } else {
          Deno.writeTextFileSync(
            backlight_path + "brightness",
            json.data.toString(),
          );
        }
        break;

      case RequestType.GetConfigs:
        const values: Config = {
          media: Deno.readDirSync(mediaPath).toArray().map((e) => e.name),
        };
        for (const key of json.config_keys) {
          values[key] = config[key];
        }
        socket.send(stfy({ type: "configs", values }));
        break;

      case RequestType.SetConfigs:
        for (const setting of Object.entries(json.config)) {
          if (setting[0] == "media") continue;
          config[setting[0]] = setting[1];
        }
        writeConfig();
        break;
    }
  };

  return response;
});
