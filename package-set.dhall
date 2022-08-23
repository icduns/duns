let upstream = https://github.com/dfinity/vessel-package-set/releases/download/mo-0.6.21-20220215/package-set.dhall
let aviate-labs = https://github.com/aviate-labs/package-set/releases/download/v0.1.6/package-set.dhall

let Package = { name : Text, version : Text, repo : Text, dependencies : List Text }
let additions = [
  { name = "io"
  , repo = "https://github.com/aviate-labs/io.mo"
  , version = "v0.3.1"
  , dependencies = [ "base" ]
  },
  { name = "rand"
  , repo = "https://github.com/aviate-labs/rand.mo"
  , version = "v0.2.2"
  , dependencies = [ "base" ]
  },
  { name = "uuid"
  , repo = "https://github.com/aviate-labs/uuid.mo"
  , version = "v0.2.0"
  , dependencies = [ "base", "encoding", "io" ]
  },
] : List Package

in  upstream # aviate-labs # additions
