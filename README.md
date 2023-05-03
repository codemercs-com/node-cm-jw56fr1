This set of node-red nodes communicate with the JoyWarrior56FR1 on a Raspberry PI.

------------

### Install NODE
Copy the folder 'node-cm-jw56fr1' into ~./node-red/node_modules and start/restart your Node-Red server.  
You need also the node-js component 'node-hid' from https://github.com/node-hid/node-hid. Please follow the install instructions on this github page

------------

### Permissions
You have to grant permissions for using the USB interface for the JoyWarrior56FR1.
Copy the 84-joywarrior56fr1.rules file into '/etc/udev/rules.d' or '/lib/udev/rules.d/' and
reload the rules by using 'udevadm control --reload-rules && udevadm trigger' or replug the 
LED-Warrior14U-DR.

------------

### Usage
This set of nodes will return the output values of the JoyWarrior56FR1 or change the configuration and filters.
The JoyWarrior56FR1 will return a report every 1 ms by itself.
The device class of JoyWarrior56FR1 is HID (Human Interface Device) more precisely it acts as a joystick with 6 axes.
You will get the acceleration data, rotation data, and also 8 inputs for buttons (not available for JoyWarrior56FR1-WP).

------------

##### Node: get data
This node will get the RAW data of JoyWarrior56FR1 without change the configuration by itself.
The RAW values have a range between 0...65535 with a zero point of 32767.

------------

##### Node: get data ext
Act like 'get data' but with the possibility to change the range of acceleration and rotation.
All filters will be set to ZERO (default configuration).

------------

##### Node: set config
Change the configuration and filter of the JoyWarrior56FR1. You can also set the configuration temporary (until reconnect) or permanent (into EEPROM). 
You can overwrite the configuration as often as you want.

For more details about the different filter options, please take a look into the data sheet (link below).

------------

##### Node: convert data
This node convert the RAW data into readable 'miliG'. The RAW values have a range between 0...65535 with a zero point of 32767. 
The node settings have to set to the appropriate device settings to get the correct data. It also set the zero point
to 0 to get positive and negative output values.

------------

### Important Note
This node is created to use the JoyWarrior56FR1 with a Raspberry PI.
The high speed interface will not support.

------------

### Known issues
- This node will only work for one connected JoyWarrior56FR1 on a Raspberry PI.
- Without right permissions, the default user 'pi' have no access to the JoyWarrior56FR1.

------------

### Links and further information
https://codemercs.com/en/joystick/acceleration
