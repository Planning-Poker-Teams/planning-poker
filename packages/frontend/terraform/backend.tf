terraform {
  backend "s3" {
    // The actual configuration is provided by command line because terraform does not allow variables inside the backend configuration
  }
}
