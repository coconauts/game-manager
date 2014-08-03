## Description

Web game manager is a “desktop” app built with cutting edge web technologies like node.js and json for indexing your list of videogames and roms. You just need to specify the exec and your local folder with games and snaps to access them immediately.

More info: http://coconauts.net/projects/game-manager

Demo video: https://www.youtube.com/watch?v=54lXxtYDMrQ&feature=youtu.be

## Quick guide to run Web Game Manager

### Install nodejs (Ubuntu 13.10)

    sudo apt-get install nodejs 
    sudo ln -s /usr/bin/nodejs /usr/bin/node 

install https://npmjs.org/install.sh

### Install nodejs dependencies

You can install all dependencies using *npm install* (See package.json file for more details)
    
### Run node (port:8888)

    node app.js
    
### Run the app

    google-chrome --app=http://localhost:8888
    chromium --app=http://localhost:8888
    firefox http://localhost:8888
    xdg-open http://localhost:8888
    
## Advanced features (optional)

### Adding it as a Google Chrome app 

Add the folder as an unpacked app in extensions (chrome://extensions)
You can see it now in the app list (chrome://newtab)

### Creating desktop shorcut to the app (looks native)

Then go to the app list (chrome://newtab)
Right mouse button on the app -> Create shorcut
If you are using Ubuntu Unity you can move the launcher config file to the unity bar now
