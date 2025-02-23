#!/bin/bash
# Turns off the backlight of the official RPi Touchscreen, when the screen is black
# (in night mode for this application)
#
# Dependencies: grim imagemagick
#
# If it doesn't work, check if the path for the backlight is correct

while true; do
    # Take a screenshot
    grim /tmp/screen.png

    # Check if the screen is just black
    if convert /tmp/screen.png -colorspace Gray -format "%[fx:mean]" info: | awk '{if ($1 == 0) print "black"}' | grep -q "black"; then
        # Turn off backlight
        sudo sh -c 'echo 1 > /sys/class/backlight/10-0045/bl_power'
        sleep 0.5
    else
        # Turn on backlight
        sudo sh -c 'echo 0 > /sys/class/backlight/10-0045/bl_power'
        sleep 1
    fi
done
