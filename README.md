Description
-----------
An alternative launcher for the game Aion with a design inspired by the new NCLauncher 2 from Korea.

<p align="center">
<img src="https://github.com/xan105/Aion-Launcher/raw/master/screenshot/main_no_maintenance.png" width="600px">
</p>

Version supported:<br/>
  - Aion EU Gameforge; all languages; normal or Steam installation

Features
--------

  - Update/Install/Repair the game *1
  - Running the game without checking client files.
  - Configuring additional settings for the game. (eg: force game fast start, disable in-game ads, ...)
  - **Install/Update Japanese sounds directly from the official Japan server and auto correct the voice order to match Aion EU/NA!**
  - Install/remove Japanese critical font fixed (Parry/Block) for EU/NA version of the game from [my Japanese voice pack](https://github.com/xan105/Aion-Japanese-Voice-Pack)
  - Show useful information about the game maintenance! (Login server status, the in-game maintenance announcement from the game login screen, the number of in-game steam players)
  - **Optional** direct login *2
  - Handle all the languages of the European version *3
  - UI is translated in English, French, and German. (Feel free to help me translate to the others languages)
  - Pull current game args from Gameforge server just like original launcher.
  - Self update _(start with -noselfupdate to skip this)_

*1 Full install only, lite step installation (play as you download the rest of the game) is not implemented.<br/>
*2 Equivalent of using command line parameter -user -password. Launcher will keep your credentials crypted *(aes-256-cbc)* on your computer but they will be passed clearly to *aion.bin* so use this at your own risk.<br/>
*3 Only one at a time though (because most people probably have only one language installed at a time and I’m lazy).

Caveats
-------

- Launcher doesn’t ask for admin rights like the original launcher does. So you might have some problem if Aion is installed in an admin restricted folder like `C:\Program Files`.
  
- To know when there is a new update this launcher scrap the gameforge http update server.<br/>
Sometimes Gameforge will push the update files there before increasing the number version reported to the official launcher.<br/>
This can cause my launcher to update the game before the official launcher does.<br/>
The official launcher appears to be checking if your local version number is equivalent to the remote last version instead of checking if it is equivalent or superior.<br/>
So in this specific case after updating, if you then launch the official launcher, it will tell you that you need to update and if you do you will actually revert back to the previous version xD.
    
- Because we are scrapping to find the last available version, it might take a while.
   
Aion NA support ?
-----------------
Not anytime soon.<br/>
To emulate the 2FA authentification the launcher does; we need to *"emulate"* their STS protocol.<br/>
Using wireshark and node net.socket I was able to have the following working :
 - `POST /Sts/Ping STS/1.0`
 - `POST /Sts/Connect STS/1.0`
 - `POST /Auth/LoginStart STS/1.0`
 
 Reaching `POST /Auth/KeyData STS/1.0` I got stuck on the key exchange. If you can help, please do so.<br/>
 More information on the Aion NA 2FA with STS Protocol [here](https://github.com/xan105/Aion-Launcher/wiki/%5BAion-NA%5D-STS-(Station-to-Station)-protocol)<br/>
 
 But this wasn't for nothing: playing (first time) with wireshark and node net.socket for this allowed me to [pull the game args from the Gameforge server](https://github.com/xan105/Aion-Launcher/wiki/Gameforge-TCP-packet-(Launcher-to-Server)) later on.
   
Screenshot
----------

<img src="https://github.com/xan105/Aion-Launcher/raw/master/screenshot/main_preparing.png"/>
<img src="https://github.com/xan105/Aion-Launcher/raw/master/screenshot/settings.png"/>
<img src="https://github.com/xan105/Aion-Launcher/raw/master/screenshot/main_no_maintenance.png">


Legal
-----
Software provided here is to be use at your own risk. This is provided as is without any express or implied warranty.<br/>
In no event or circumstances will the authors or company be held liable for any damage to yourself or your computer that may arise from the installation or use of the free software aswell as his documentation that is provided on this website.<br/>
And for anything that may occur as a result of your use, or inability to use the materials provided via this website.<br/> We accept no responsibilities in case your Aion provider decide to suspend temporarely or defenitely your Aion account.<br/>
<br/>
Unless otherwise specified you are free to:<br/>

- Share — copy and redistribute the material in any medium or format<br/>
- Adapt — remix, transform, and build upon the material<br/>

Under the following terms:<br/>

- Attribution — You must give appropriate credit, provide a link, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.<br/>
- NonCommercial — You may not use the material for commercial purposes.<br/>

© 2018 Anthony Beaumont. All rights reserved. <br/>
Other trademarks, copyright are the property of their respective owners. No copyright or trademark infringement is intended by using third-party resources. Except where otherwise specified, the contents of this project is subject to copyright.<br/>

Aion™ is a registered trademark of NCSOFT Corporation.<br/>
Copyright © NCSOFT Corporation. All Rights Reserved.<br/>

© 2009 NCSOFT Corporation. NCJapan K.K. The Tower of AION™, AION™ is a trademark of NCSOFT Corporation. <br/>

This project is not affiliated nor associated with NCSOFT Corporation, NCJapan K.K. Other trademarks are the property of their respective owners. No copyright or trademark infringement is intended in using The Tower of AION™, AION™ content.<br/>
  
