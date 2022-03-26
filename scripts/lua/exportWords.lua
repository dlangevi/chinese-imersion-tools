local cta = require "cta"
local config = require "Config"
local known = cta.knownWords()

local dictionary = cta.dictionary()
-- todo do dictionary lookups to get traditional characters
--
local outputfile = io.open(config.ctaWords, "w")
io.output(outputfile)
for word in known:words() do
    io.write(word .. "\n")
end
