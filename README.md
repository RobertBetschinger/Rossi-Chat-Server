# "Rossi-Chat-Server" 

**Das ist der Backend-Server für den "Rossi-Chat" für das Praxisseminar an der Uni Regensburg  "Entwicklung eines sicheren Messengers und Durchführung von Angriffen dagegen".**

Zum "Rossi-Chat" gehört ebenfalls eine Android Applikation, welche in diesem Git-Repository zu finden ist: https://gitlab.itsec.ur.de/frm32240/rossichat




Desweiteren gehört zur Applikation eine MONGODB Datenbank, welche über DBAAS Atlas gehostet wird. Der Zugriff auf diese wurde an die entsprechende Email des Betreuers gewährt.

Der Rossi-Chat-Server wurde mittels Heroku deployed und bereitgestellt. Dieses Repository ist bei Heroku hinterlegt, sodass der Server automatisch neu deployed wird, wenn der Master Branch sich ändert. Auf Heroku sind ebenfalls die Environment Variablen hinterlegt. Der Zugriff für Heroku wurde an die entsprechende Email des Betreuers gewährt.

Beim Backend-Server handelt es sich dabei um einen Node.JS Server mit Socket.IO und Express.JS.

# Installation des Server Lokal:

* Clonen des Repositorys
* Wechseln in das Entsprechende Verzeichnis
* run "npm install"
* run "npm start" 

"npm start" startet einen Deamon, welcher bei Dateiänderungen vom Server, diesen automatisch neu startet. 

* Für das lokale Hosten des Servers braucht es die .env File mit den Zugangsdaten für die MongoDB, Messagebird und ein Server JW Access Token Secret) Diese ist natürlich nicht im GitHub hochgeladen, jedoch an den Betreuer per Mail versendet worden. Alternativ sind die Variablen auch in Heroku einsehbar.

# Testen der Applikation mittels lokalem Server:

Standardmäßig verbindet sich die App mit dem auf Heroku gehosteten Server. Bei Bedarf kann sich ein emulierter Client mit dem localhost des computers verbinden. Hierfür die Zeilen 87 und 91 in RossiSocket.java aktivieren und die Zeilen 88 und 92 auskommentieren. Es kann allerdings sein, dass noch weitere Einstellungen am Emulator selbst geändert werden müssen, damit es funktioniert.

# Struktur des Servers:

* server.js (express server, socket.IO Eventloop + Listening Events, JWT, Rate Limiting)
* connect.js (MongoDB Modul mit DB Modell und Funktionen zur Datenverarbeitung)
* verify.js (SMS Verifikations-Modul mit Messagebird Anbindung)
* package.json (Auflistung aller notwendigen Abhänggigkeiten)

# Third-Party Anbindung
Heroku

Heroku wird mit einem kostenpflichtigen "hobby" Dyno Upgrade betrieben. Dieses Upgrade wird für den Zeitraum von 2 Monaten nach der Abgabe aufrechterhalten und dann zurückgesetzt auf den Free Dyno.

Messagebird

Im aktuellen Setup werden SMS über den Messagebird Zugang für € 0,07 versendet. 
Wir würden die API Keys mit einem Guthaben von knapp € 10,00 hierfür für einen Zeitraum von 2 Monaten zum Testen der Applikation zur Verfügung stellen und die Keys danach deaktivieren.
Sollte die App und der Server in Zukunft, wie bereits erwähnt in der Lehre Anwendung finden, sollte hier ein eigener Messagebird Account erstellt werden und die Keys dementsprechend ersetzt werden.
Änderungen werden dadurch an folgenden Stellen notwendig:
- neue Keys hinterlegen in Heroku Confiv Vars
- .env File (im Falle eines lokalen Hostens)



Created by:
 - timobunghardt
 - Adrian Lanzl 
 - robertbetschinger
