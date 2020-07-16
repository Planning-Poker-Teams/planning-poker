#!/usr/bin/env bash

for filename in *.puml
do
	echo "Generating "$filename.svg""
  cat "$filename" | docker run --rm -i think/plantuml > "$filename.svg"
done