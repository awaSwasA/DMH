#!/bin/bash
display_list=$(xrandr --listmonitors)
kdialog --title "DMH" --msgbox "Current screen mode:\n$display_list"
xrandr --addmode DP2 1920x1080
update_display_list=$(xrandr)
kdialog --title "DMH" --msgbox "Success!\nNew mode for second display should be added.\n$update_display_list"