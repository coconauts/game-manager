#!/bin/bash

echo "#!/bin/bash
sleep 1 && xdg-open http://localhost:8888 &
cd `pwd` && node app.js >> game-manager.log 2>&1"  > /usr/bin/game-manager

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
