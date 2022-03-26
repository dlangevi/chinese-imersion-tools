--[[
@cta Prompts the user for a file and then finds all the sentences in the
 file that have only one unknown word. Only prints words that occur more than 5 times
]] --
local Parser = require "DocumentParser"
local Output = require "Output"
local config = require "Config"

local lfs = require "lfs"

local function traverseDirectory(directory)
    for file in lfs.dir(directory) do
        -- ignore the . and .. directories
        if file ~= "." and file ~= ".." then
            -- get the full path of the file on the disk
            local fullPath = directory .. "/" .. file

            -- query the 'mode' attribute of this file
            local mode = lfs.attributes(fullPath, "mode")

            -- if it's a directory, then call the function again
            -- on this new directory
            if mode == "directory" then
                traverseDirectory(fullPath)
            elseif mode == "file" then
                -- it's a file so check the filename ends in .txt
                if file:match("%.txt$") then
                    processDocument(fullPath)
                end
            end
        end
    end
end

--This function finds the filename when given a complete path
function GetFilename(fullpath)
    path, file = fullpath:match("^(.+)/([^/]+)$")
    return file
end

function processDocument(filename)
    allUnknown, document, unknownSentences, soFar = Parser.processDocument(filename)

    local outputFilename = config.parsedSentences .. GetFilename(filename)
    Output.outputTxtFile(outputFilename, allUnknown, document, unknownSentences, soFar)
    outputFilename = config.parsedSentences .. GetFilename(filename) .. ".json"
    Output.outputJsonFile(outputFilename, allUnknown, document, unknownSentences, soFar)
    print("Processed " .. filename)
end

local directory = config.library
if directory ~= nil then
    traverseDirectory(directory)
end
