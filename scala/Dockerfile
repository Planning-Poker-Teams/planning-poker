FROM hseeberger/scala-sbt:8u242_1.3.8_2.13.1

WORKDIR /usr/src/app
COPY . /usr/src/app
RUN sbt compile

EXPOSE 8080

ENTRYPOINT ["sbt"]
CMD ["run"]