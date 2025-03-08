# ClockPi 2

This is ClockPi 2 which moved from localStorage to a separate WebSocket server.

Turn your Raspberry Pi with a touchscreen into a clock!

## Installation

1. Use Deno to install the dependencies with `deno install`
2. Build the Svelte Project with `deno task build`
3. Put the files from `build` to `/var/clockpi/`  
   (In case you didn't noticed: Anything other than Linux is not and will not be supported!)
4. [OPTIONAL if not using a device with backlight settings]  
   Set up an udev-rule for your account to set backlight settings in `/sys/class/backlight` without sudo. (Guide is WIP)
5. Navigate into the backend server using `cd backend`
6. Install dependencies again for this project
7. Build the backed with either `deno task compile_x86-64` or `deno task compile_aarch64`
8. [OPTIONAL but recommended]  
   Set up an service to start the backend server, when logging in. (Guide is WIP)
9. [OPTIONAL but recommended]  
   Set up an autostart-entry to automatically open the webserver in Kiosk-mode. (Guide is WIP)
