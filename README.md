# myhome
Controlador de dispositivos domésticos desenvolvido em NodeJs

Procedimento de instalação do Raspberry Pi com o app controlador

- Baixar o sistema operacional em https://www.raspberrypi.org/downloads/raspbian/<br>
- Instalá-lo em um cartão SD, conforme procedimento no próprio site do raspberrypi<br>
- Iniciar o sistema com o cartão SD e configurar rede (wifi ou ethernet)<br>
- Atualizar o sistema “sudo apt-get update; sudo apt-get upgrade”<br>
- Instalar o openssh-server “sudo apt-get install openssh-server”<br>
- Instalar o vim “sudo apt-get install vim”<br>
- Configurar o sshd para receber conexões “sudo vi /etc/ssh/sshd_config” e descomentar as linhas “ListenAddress ::” e “ListenAddress 0.0.0.0”<br>
- Habilitar a inicialização automática do sshd “sudo systemctl ssh enable”<br>
- Instalar o npm “sudo apt-get install npm”<br>
- Atualizar o npm e node “sudo npm cache clean -f; sudo npm install -g n; sudo n latest”<br>
- Baixar o pacote de instalação do controlador no diretório “/tmp”<br>
- Descompactar o pacote “cd /tmp; tar -zxpvf myhome-1.0.tgz”<br>
- Como root, executar o instalador “cd myhome; sudo ./install.sh”<br>
- Como root, iniciar o serviço “sudo service myhome start”<br>
