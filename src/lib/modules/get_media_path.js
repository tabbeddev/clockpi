export default function resolveMediaPath(file_name, default_value) {
  if (file_name == "Default" || !file_name) {
    return default_value;
  } else {
    const url = new URL(location);
    url.port = "8109";
    url.pathname = "/media/" + file_name;
    return url.href;
  }
}
