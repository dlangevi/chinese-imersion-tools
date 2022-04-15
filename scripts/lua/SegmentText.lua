--[[
@cta Segmenting Chinese text is non trivial, but is something I want to support doing
eventually. For now, have cta do the text segmentation for us and allow that to then be
analysed by other js scripts
]] --

local config = require "Config"
local cta = require "cta"
local lfs = require "lfs"
local JSON = require "JSON"
local Library = require "BookLibrary"
local os = require "os"

--This function finds the filename when given a complete path
function GetFilename(fullpath)
    path, file = fullpath:match("^(.+)/([^/]+)$")
    return file
end

local function traverseDirectory(directory)
    local lastChar = directory:sub(-1)
    if lastChar == "/" then
        directory = directory:sub(1, -2)
    end
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
                    segmentFile(fullPath)
                end
            end
        end
    end
end

function file_exists(name)
    local f = io.open(name, "r")
    if f ~= nil then
        io.close(f)
        return true
    else
        return false
    end
end

function segmentFile(filename)
    local info = Library.getBookData(filename)
    local bookName = info.entry
    local outputFile = info.segmentedText
    local outputTxt = info.outputTxt
    if file_exists(outputFile) then
        print(outputFile .. " already exists")
        return
    end
    os.execute("cp '" .. filename .. "' '" .. outputTxt .. "'")

    local document = cta.Document(filename)
    local sentences = {}
    for line in document:lines() do
        for sentence in line:sentences(true) do
            local words = {}
            for word, i, _ in sentence:words(true) do
                table.insert(words, {word, i})
            end
            table.insert(sentences, words)
        end
    end

    print("writing: " .. outputFile)
    local output = io.open(outputFile, "w")
    io.output(output)
    io.write(JSON:encode(sentences))
    io.close(output)

end

local directory = config.library
if directory ~= nil then
    traverseDirectory(directory)
end
