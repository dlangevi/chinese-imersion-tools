local JSON = require "JSON"
local config = require "Config"
local FrequencyData = {}

function FrequencyData.processWordListCTA()
    local files = {
        config.frequencyData .. "Jieba.txt",
        config.frequencyData .. "Beijing Language and Culture University Corpus.txt",
        config.frequencyData .. "Loach.txt",
        config.frequencyData .. "Movies Ghent University.txt",
        config.frequencyData .. "The Chairman Bao.txt"
    }

    local rankings = {}
    for key, filename in ipairs(files) do
        local document = cta.Document(filename)
        document:waitUntilProcessed()

        local rank = 0
        for line in document:lines() do
            for word in line:sentences() do
                wordstring = tostring(word)
                rank = rank + 1
                local previous = rankings[wordstring]

                if previous == nil or previous > rank then
                    rankings[wordstring] = rank
                end
                --if rank > 100000 then break end
            end
            --if rank > 100000 then break end
        end
    end
    return rankings
end

function FrequencyData.processWordListJSON()
    local files = {
        config.frequencyData .. "Jieba.json",
        config.frequencyData .. "Beijing Language and Culture University Corpus.json",
        config.frequencyData .. "Loach.json",
        config.frequencyData .. "Movies Ghent University.json",
        config.frequencyData .. "The Chairman Bao.json"
    }

    local rankings = {}
    for key, filename in ipairs(files) do
        local jsonFile = io.open(filename, "r")
        io.input(jsonFile)
        local wordList = JSON:decode(io.read())

        local rank = 0
        for _, word in ipairs(wordList) do
            rank = rank + 1
            local previous = rankings[word]
            if previous == nil or previous > rank then
                rankings[word] = rank
            end
            if rank > 100000 then
                break
            end
        end
        io.close(jsonFile)
    end
    return rankings
end

function FrequencyData.computeWordListJSON()
    local rankings = processWordListJSON()
    local output = io.open(config.frequencyData .. "Combined.json", "w")
    io.output(output)
    io.write(JSON:encode(rankings))
    io.close(output)
end

function FrequencyData.loadWordListJSON()
    local input = io.open(config.frequencyData .. "Combined.json", "r")
    io.input(input)
    local wordList = JSON:decode(io.read())
    io.close(input)
    return wordList
end

return FrequencyData
