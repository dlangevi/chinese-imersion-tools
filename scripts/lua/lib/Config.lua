local JSON = require "JSON"

-- MUST RUN CTA FROM GIT DIRECTORY
local jsonFile = io.open("./config.json", "r")
io.input(jsonFile)
local jsonString = io.read("*all")
local config = JSON:decode(jsonString)
io.close(jsonFile)
return config
