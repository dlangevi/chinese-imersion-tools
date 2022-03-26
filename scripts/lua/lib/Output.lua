local Output = {}

local FrequencyData = require "FrequencyData"
local JSON = require "JSON"

local rankings = nil
local function convertRanking(word)
    --"★★★★★" = 1st - 1.5k (most common words)
    --"★★★★" = 1.5k - 5k
    --"★★★" = 5k - 15k
    --"★★" = 15k - 30k
    --"★" = 30k - 60k
    if rankings == nil then
        rankings = FrequencyData.loadWordListJSON()
    end

    rank = rankings[tostring(word)]
    if rank == nil then
        return "none", 99999999
    elseif rank < 1500 then
        return "★★★★★", rank
    elseif rank < 5000 then
        return "★★★★", rank
    elseif rank < 15000 then
        return "★★★", rank
    elseif rank < 30000 then
        return "★★", rank
    elseif rank < 60000 then
        return "★", rank
    else
        return "none", 99999999
    end
end

local function calculateWordStats(allUnknown)
    local words = 0
    local occurances = 0
    for word, freq in pairs(allUnknown) do
        occurances = occurances + freq
        words = words + 1
    end
    return words, occurances
end

function Output.outputTxtFile(outputFilename, allUnknown, document, unknownSentences, soFar)
    local outputfile = io.open(outputFilename, "w")
    io.output(outputfile)

    local words, occurances = calculateWordStats(allUnknown)
    io.write("Total number of unknown words with sentences " .. words .. "\n")
    io.write("Total number of occurances covered " .. occurances .. "\n")

    if document ~= nil then
        local stats = document:allStatistics()
        local firstIndex = next(stats)
        local firstWord = stats[firstIndex]
        local progress = occurances / firstWord.frequency * firstWord.percentageFrequency
        progress = tonumber(string.format("%.3f", progress))
        io.write("Learning these words will cover " .. progress .. "% of the text\n")
    end

    if #unknownSentences > 0 then
        io.write("\n")
        io.write("Mostly known sentences, sorted by percentage of known words" .. "\n")
        io.write("-----------------------------------------------------------" .. "\n")
        for _, info in ipairs(unknownSentences) do
            local stars, rank = convertRanking(info.unknown)
            local progress = string.format("%.1f", info.position / soFar * 100) .. "%"
            local target = 1
            if info.position / soFar < target then
                io.write(
                    info.frequency,
                    "\t",
                    stars,
                    "\t",
                    progress,
                    "\t",
                    info.unknown .. "。",
                    "\t",
                    info.sentence .. "\n"
                )
            end
        end
    end
    io.close(outputfile)
end

function Output.outputJsonFile(outputFilename, allUnknown, document, unknownSentences, soFar)
    local outputfile = io.open(outputFilename, "w")
    io.output(outputfile)

    local jsonOutput = {}
    local words, occurances = calculateWordStats(allUnknown)
    jsonOutput["words"] = words
    jsonOutput["occurances"] = occurances

    local knownStats = document:knownStatistics()
    local currentKnown = 0
    for _, stat in ipairs(knownStats) do
        currentKnown = currentKnown + stat.percentageFrequency
    end

    local stats = document:allStatistics()
    local firstIndex = next(stats)
    local firstWord = stats[firstIndex]
    local totalWords = firstWord.frequency / firstWord.percentageFrequency * 100
    local progress = occurances / firstWord.frequency * firstWord.percentageFrequency
    progress = tonumber(string.format("%.3f", progress))
    jsonOutput["progress"] = progress
    jsonOutput["totalWords"] = totalWords
    jsonOutput["currentKnown"] = currentKnown

    jsonOutput["sentences"] = {}
    sentenceObj = jsonOutput["sentences"]

    for _, info in ipairs(unknownSentences) do
        local stars, rank = convertRanking(info.unknown)
        if sentenceObj[info.unknown] == nil then
            sentenceObj[info.unknown] = {
                frequency = info.frequency,
                stars = stars,
                sentences = {}
            }
        end

        local progress = string.format("%.1f", info.position / soFar * 100) .. "%"
        table.insert(
            sentenceObj[info.unknown]["sentences"],
            {
                position = progress,
                sentence = info.sentence
            }
        )
    end

    io.write(JSON:encode(jsonOutput))
    io.close(outputfile)
end

return Output
