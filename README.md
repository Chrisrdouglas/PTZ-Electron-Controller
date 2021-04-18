# PTZ-Electron-Controller
A PTZ Camera controller application that uses a Wii Nunchuck or Xbox One controller to control a camera. Currently the only tested camera is the Panasonic AW-HN40 but documentation from Panasonic's website says this should work with any camera in the HE40 series.


# Why I made this
* Because [this](https://na.panasonic.com/us/audio-video-solutions/broadcast-cinema-pro-video/camera-controllers/aw-rp150-touchscreen-remote-camera-controller) has a MSRP of $4,700.
* And [this](https://na.panasonic.com/us/audio-video-solutions/broadcast-cinema-pro-video/camera-controllers/aw-rp60-compact-remote-ptz-camera-controller) has a MSRP of $2,375
* Because I'm unemployed
    * I need something to do until I find a job
    * If you're hiring then here's a [link to my resume](http://jobshirt.us/)
    * Feel free to [donate](https://paypal.me/Doogle9733/?locale.x=en_US)! I'm a bit poor at the moment because of the whole unemployed thing


# What's Next?
I'm probably going to work a bit on the controls to make them feel more smooth and responsive. The driver for the AW-HN40 needs a priority queue that will only send the most recent command of a certain command type. It also needs to have a limit put on it so that it can only send a command once ever 130 ms so that we're not bombarding it with commands all the time. Now, the reason why this is going to take priority is because the AW-HN40 and similar cameras use EEPROM for storage and from what I understood in the documentation, any kind of command that gets sent to it (like movement speed) will be written to the EEPROM. Since EEPROM has the limitation of only being able to accept a certain number of writes before it stops working correctly, we need to focus on this first.


# Warranty
You can download and test this for yourself but it doesn't come with any kind of warranty and currently has a known bug that could damage your camera. Use at your own risk.