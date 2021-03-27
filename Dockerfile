FROM archlinux:latest

WORKDIR app

RUN useradd -m cutlistuser
RUN pacman -Sy
RUN pacman -S reflector --noconfirm
RUN reflector --verbose --latest 5 --sort rate --save /etc/pacman.d/mirrorlist
RUN pacman -Suy --noconfirm
RUN pacman -S coin-or-cgl gcc git nodejs npm make openssh --noconfirm

USER cutlistuser
CMD ["/usr/bin/bash", "./run.sh"]
