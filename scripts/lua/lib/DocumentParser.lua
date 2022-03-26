--[[
@cta Prompts the user for a file and then finds all the sentences in the
file that have only one unknown word. Only prints words that occur more than 5 times
]] --
local View = require "DocumentView"
local cta = require "cta"

local Parser = {}

local function sentenceMostlyKnown(sentence, known)
    local total = 0
    local totalKnown = 0
    local totalUnknown = 0
    local unknown = ""
    for word in sentence:words() do
        if known:contains(word) then
            totalKnown = totalKnown + 1
        else
            totalUnknown = totalUnknown + 1
            unknown = word
        end
        total = total + 1
    end

    local passesThreshold = totalUnknown == 1
    return passesThreshold, unknown
end

local function sentenceKnown(sentence, known, exception)
    local allKnown = true
    for word in sentence:words() do
        if not known:contains(word) then
            if not (word == exception) then
                allKnown = false
            end
        end
    end
    return allKnown
end

function Parser.processDocument(filename)
    if filename == nil then
        error("No file specified")
    end
    local document = cta.Document(filename)
    local known = cta.knownWords()
    local unknownSentences = {}
    local stats = document:unknownStatistics({keyByWord = true})

    local allUnknown = {}

    local view = View.new(document)
    local soFar = 0
    while true do
        local sentence = View.nextSentence(view)
        if sentence == nil then
            break
        end

        local mostlyKnown, unknown = sentenceMostlyKnown(sentence, known)
        soFar = soFar + 1
        if mostlyKnown then
            local combinedSentence = tostring(sentence)

            for i = 1, 6 do
                local other = View.relativeSentence(view, i)
                if other == nil then
                    break
                end
                local isKnown = sentenceKnown(other, known, unknown)
                if not isKnown then
                    break
                end
                combinedSentence = combinedSentence .. other
            end

            for i = 1, 6 do
                local other = View.relativeSentence(view, -1 * i)
                if other == nil then
                    break
                end
                local isKnown = sentenceKnown(other, known, unknown)
                if not isKnown then
                    break
                end
                combinedSentence = other .. combinedSentence
            end

            local frequency = 0
            if stats[unknown] ~= nil then
                frequency = stats[unknown].frequency
                local info = {sentence = combinedSentence, unknown = unknown, frequency = frequency, position = soFar}
                table.insert(unknownSentences, info)
                allUnknown[unknown] = frequency
            end
        end
    end

    table.sort(
        unknownSentences,
        function(left, right)
            if left.frequency == right.frequency then
                if right.unknown == left.unknown then
                    return right.position > left.position
                end
                return right.unknown > left.unknown
            end
            return right.frequency < left.frequency
        end
    )

    return allUnknown, document, unknownSentences, soFar
end

return Parser
