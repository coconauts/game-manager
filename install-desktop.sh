#!/bin/bash

echo "#!/bin/bash
firefox localhost:8888
node `pwd`/app.js >> `pwd`/game-manager.log"  > /usr/bin/game-manager

chmod +x /usr/bin/game-manager

cp public/icon.png /usr/share/icons/game-manager.png

echo "[Desktop Entry]
Name=Game Manager
GenericName=Game Manager
Comment=Game manager in NodeJS
Exec=game-manager
Icon=/usr/share/icons/game-manager.png
StartupNotify=true
Terminal=true
Type=Application" > /usr/share/applications/game-manager.desktop

echo "game-manager.desktop was created in /usr/share/applications/"

