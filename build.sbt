name := """planning-poker-backend"""
version := "1.0"
scalaVersion := "2.11.8"

libraryDependencies ++= {
  val akkaVersion = "2.4.16"
  val akkaHttpVersion = "10.0.1"
  
  Seq(
    "com.typesafe.akka" %% "akka-actor"             % akkaVersion,
    "com.typesafe.akka" %% "akka-testkit"           % akkaVersion,
    "com.typesafe.akka" %% "akka-http"              % akkaHttpVersion,
    "com.owlike"        %% "genson-scala"           % "1.4",
    "org.scalatest"     %% "scalatest"              % "3.0.1"       % "test"
  )
}
