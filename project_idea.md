Project Idea

A standalone app with an integrated terminal (zsh or standard or something else, but it has to be the full terminal without restrictions) for handling runpod connections.
Idea behind this is because I find it tedious managing the pods and network drive in runpod. Working with a network drive in runpod means I cannot stop pods instead having to terminate them when they aren't needed anymore. This means firing up new pods, having to run same commands, installing packages before being able to work. Also, the ip and ports change from pod to pod, so even if I save commands in a textfile, I have to adjust them all for the new IPs and porst. This takes too much time for tasks that are simply just brainless tiping jobs.
So the app is not working directly via APIs or some advanced shit, instead it is just a way to create profiles, create a command library and then if we want to create a ssh connection, we just have to press a button and the IP and ports from the profile are put in the command in the build in terminal.

The terminal should also allow multiple tabs,so we could have one tab with the open ssh connection, one tab for the ui tunneling and one tab for file transfers.

So the app has three sections:

1) Pods
Create, edit, delete pod profiles:
name, description, ip, port, local port (for tunneling), ssh URL
On this section there is a button where the user can set the SSH certificate location

2) Library
Create, edit, delete commands:
Single line commands -> name, command, assigned_pod (optional)
(e.g. name: "Start kohya gui" command: "python kohya_gui.py --headless --listen 127.0.0.1 --server_port 7860", name: "Install basic packages" command: "apt-get update && apt install -y tmux p7zip-full wget git htop build-essential")

3) terminal
original terminal, just embedded (like for example in VSCode the full terminal is included), buttons:

a) SSH (asks for the pod, if current terminal or new tab and builds the ssh command and paste it in the terminal window and runs it):
"ssh xdloe5m2jlkv3m-64410e07@ssh.runpod.io -i ~/.ssh/id_ed25519"
command has been built from template "ssh <ssh URL> -i ~/.ssh/<SSH certificate>" and the selected pod profile

b) Tunnel (asks for the pod, if current terminal or new tab and builds the ssh tunnel command and paste it in the terminal window and runs it):
"ssh -N -L 7866:127.0.0.1:7860 -i $env:USERPROFILE\.ssh\id_ed25519 -p 15353 root@213.173.98.205"
command has been built from template "ssh -N -L <LOCAL PORT>:127.0.0.1:7860 -i $env:USERPROFILE\.ssh\<SSH certificate> -p <PORT> root@<IP>" and the selected pod profile

c) File transfer (asks for the pod, if current terminal or new tab, then asks if download or upload, based on that shows local file selection or local target folder and then input field for the remote file or remote target folder):
DOWNLOAD:
scp -P 15353 -i "$env:USERPROFILE\.ssh\id_ed25519" ` root@213.173.98.205:/workspace/kohya_ss/outputs/FILENAME ` "C:\Users\seile\Downloads\automatic\webui\models\Lora\"
command has been built from template scp -P <PORT> -i "$env:USERPROFILE\.ssh\<SSH certificate>" ` root@<IP>:<remote file location> ` "<local target folder>" and the selected pod profile

UPLOAD:
scp -P 15353 -i "$env:USERPROFILE\.ssh\id_ed25519" "V6.json" "root@213.173.98.205:/workspace/dataset/"
command has been built from template scp -P <PORT> -i "$env:USERPROFILE\.ssh\<SSH certificate>" "<local file>" "root@<IP>:<remote target folder>" and the selected pod profile

d) Command (asks for the pod, if current terminal or new tab and then shows the command library (prefiltered showing only commands wihtout assigned pod and for the selected pod, search bar to search for commands))

IDEA: Instead of asking every single time, if commands should be in same terminal window or new tab we could have a toggle that is setting a global behaviour.



This way I could for example set up a "kohya_ss" pod assign commands and work with it. Next time, when I create the next kohya_ss pod I just have to update the IP, port and SSH URL once and can work with all commands, etc.

This should be a standalone app that I can open on my mac m1 max (Tahoe and lower).
App should be simple, easy to use, well designed and not overblown.
