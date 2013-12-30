#!/bin/bash

echo -n "Attack at dawn!!" | openssl enc -aes-128-cbc -K 6162636465666768696a6b6c6d6e6f70 -iv 7172737475767778797a7b7c7d7e7f80 -out openssl_enc.bin
openssl enc -d -aes-128-cbc -K 6162636465666768696a6b6c6d6e6f70 -iv 7172737475767778797a7b7c7d7e7f80 -in openssl_enc.bin -out openssl_dec.bin