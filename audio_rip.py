import subprocess
import time
import psutil
import os
import signal
import shlex

video = ["livestreamer", "--http-header", "Client-ID=qcz5pn5600hblsmsfk9kz9gr3wlw69", "-o", "/Users/ptarsoly/Desktop/twitchcon2k19/output.m3u8", "twitch.tv/gamesdonequick/users?login=ptarsoly", "worst"]

proc = subprocess.Popen(video, shell=False, preexec_fn=os.setsid) 

time.sleep(20)

os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
print("process killed!")
time.sleep(2)


cmd = "ffmpeg -y -i /Users/ptarsoly/Desktop/twitchcon2k19/output.m3u8 -acodec copy -bsf:a aac_adtstoasc -vcodec copy /Users/ptarsoly/Desktop/twitchcon2k19/out.mp4"
subprocess.Popen(shlex.split(cmd), shell=False)

time.sleep(2)

cmd = "ffmpeg -y -i out.mp4 -f mp3 -ab 192000 -vn speech.mp3"

subprocess.Popen(shlex.split(cmd), shell=False)

cmd = "rm output.m3u8"

subprocess.Popen(shlex.split(cmd), shell=False)

# useful commands

# ffmpeg -i output.m3u8 -acodec copy -bsf:a aac_adtstoasc -vcodec copy out.mp4

# ffmpeg -i out.mp4 -f mp3 -ab 192000 -vn music.mp3