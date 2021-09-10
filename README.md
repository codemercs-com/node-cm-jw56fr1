This set of node-red nodes communicate with the JoyWarrior56FR1 on a Raspberry PI.


Install NODE
Copy the folder 'node-cm-jw56fr1' into ~./node-red/node_modules and start/restart your Node-Red server.


Permissions
You have grand permissions for using the USB interface for the JoyWarrior56FR1.
Copy the 84-joywarrior56fr1.rules file into '/etc/udev/rules.d' or '/lib/udev/rules.d/' and
reload the rules by using 'udevadm control --reload-rules && udevadm trigger' or replug the 
LED-Warrior14U-DR.
