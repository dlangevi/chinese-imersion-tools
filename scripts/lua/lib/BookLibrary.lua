-- This works with a file exported from calibre containing (authors, cover, title) fields

local config = require "Config"
local JSON = require "JSON"

local BookLibrary = {}

--This function finds the filename when given a complete path
function GetFilename(fullpath)
    path, file = fullpath:match("^(.+)/([^/]+)$")
    return file
end

function GetFilepath(fullpath)
    path, file = fullpath:match("^(.+)/([^/]+)$")
    return path
end

function loadLibrary()
    local books = {}
    local catalogue = {}
    local cmd =
        "calibredb --library-path '" ..
        config.library .. "' list -f cover,authors,title --for-machine --sort-by authors"
    local handle = io.popen(cmd)
    local result = handle:read("*a")
    handle:close()
    booksJson = JSON:decode(result)
    for a, b in pairs(booksJson) do
        if (b.cover ~= nil) then
            local author = b.authors
            local path = GetFilepath(b.cover)
            local title = b.title
            local entry = author .. " - " .. title
            local segmentedText = config.segmentedText .. entry .. ".json"
            local outputTxt = config.segmentedText .. entry .. ".txt"
            books[path] = {
                author = author,
                title = title,
                path = path,
                entry = entry,
                segmentedText = segmentedText,
                outputTxt = outputTxt
            }
            catalogue[entry] = {
                author = author,
                title = title,
                path = path,
                entry = entry,
                segmentedText = segmentedText,
                outputTxt = outputTxt
            }
        end
    end
    -- save the book results so they can be used by other applications
    local catalogueFile = io.open(config.catalogue, "w")
    io.output(catalogueFile)
    io.write(JSON:encode(catalogue))
    io.close(catalogueFile)
    return books
end

-- Path -> (author title)
local Books = loadLibrary()
function BookLibrary.getBookData(filepath)
    path = GetFilepath(filepath)
    return Books[path]
end

return BookLibrary
