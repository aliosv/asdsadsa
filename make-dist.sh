#!/usr/bin/env bash

borschik --input=dist/banners.css --output=dist/_banners.css
postcss --use autoprefixer --autoprefixer.browsers "> 2%" -o dist/_banners.css dist/_banners.css
