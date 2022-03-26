local DocumentView = {}

function DocumentView.new(document)
    local lineIter = document:lines(false)
    local currentLine = lineIter()
    local sentenceIter = currentLine:sentences()
    local view = {
        first = 0,
        current = -1,
        last = -1,
        -- TODO include newlines (set to true)
        lineIter = lineIter,
        currentLine = currentLine,
        sentenceIter = sentenceIter
    }
    return view
end

-- unwraps the logic for traversing sentancewise into a single iterator
-- only used locally manages 20 sentances in memory at a time
local function loadSentance(view)
    -- we have already finished document earlier
    if view.currentLine == nil then
        return false
    end

    local nextSentence = view.sentenceIter()
    -- line has been depleted, need a new one
    while nextSentence == nil do
        -- get next line
        view.currentLine = view.lineIter()

        -- we have finished document
        if view.currentLine == nil then
            return false
        end

        view.sentenceIter = view.currentLine:sentences()
        -- if this is a blank line maybe nextSentence is still nil?
        nextSentence = view.sentenceIter()
    end
    -- nextSentence should not be able to be nil here
    assert(nextSentence ~= nil, "nextSentence was nil!")
    if (nextSentence == nil) then
        return false
    end

    local last = view.last + 1
    view.last = last
    view[last] = nextSentence
    if (view.last - view.first == 20) then
        local first = view.first
        view[first] = nil -- garbage collection
        view.first = first + 1
    end

    return true
end

function DocumentView.nextSentence(view)
    view.current = view.current + 1
    if view[view.current] == nil then
        local loaded = loadSentance(view)
        -- had no more sentances to load, we must be done
        if loaded == false then
            return nil
        end
    end
    return view[view.current]
end

-- loads related to current sentence (so +1, -2, etc)
function DocumentView.relativeSentence(view, position)
    local absolutePos = view.current + position
    if absolutePos < 0 then
        return nil
    end
    if position < 0 then
        -- may return nil, this is fine
        return view[absolutePos]
    end

    while (view[absolutePos] == nil) do
        local loaded = loadSentance(view)
        -- had no more sentances to load, we must be done
        if loaded == false then
            return nil
        end
    end

    return view[absolutePos]
end

return DocumentView
