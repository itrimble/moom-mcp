#!/usr/bin/env osascript

-- Rectangle + Moom Layout Creator for Multi-Monitor Setup
-- This script creates developer-focused layouts using Rectangle for positioning

-- Helper function to trigger Rectangle shortcuts
on triggerRectangle(shortcut)
    tell application "System Events"
        key code shortcut's keyCode using shortcut's modifiers
        delay 0.5
    end tell
end triggerRectangle

-- Rectangle keyboard shortcuts (you may need to adjust based on your Rectangle settings)
-- Default Rectangle shortcuts:
property leftHalf : {keyCode:123, modifiers:{control down, option down}} -- left arrow
property rightHalf : {keyCode:124, modifiers:{control down, option down}} -- right arrow
property topHalf : {keyCode:126, modifiers:{control down, option down}} -- up arrow
property bottomHalf : {keyCode:125, modifiers:{control down, option down}} -- down arrow
property topLeft : {keyCode:36, modifiers:{control down, command down}} -- enter
property topRight : {keyCode:51, modifiers:{control down, command down}} -- delete
property bottomLeft : {keyCode:122, modifiers:{control down, command down}} -- F1
property bottomRight : {keyCode:120, modifiers:{control down, command down}} -- F2
property maximize : {keyCode:36, modifiers:{control down, option down}} -- enter
property center : {keyCode:8, modifiers:{control down, option down}} -- C
property nextDisplay : {keyCode:124, modifiers:{control down, option down, command down}} -- right arrow

-- Layout 1: Full Stack Development
on createFullStackLayout()
    display notification "Creating Full Stack Development Layout" with title "Moom Layout Creator"
    
    -- VS Code on main display (center)
    tell application "Visual Studio Code" to activate
    delay 0.5
    my triggerRectangle(maximize)
    delay 0.5
    
    -- Edge on right display
    tell application "Microsoft Edge" to activate
    delay 0.5
    my triggerRectangle(nextDisplay)
    delay 0.5
    my triggerRectangle(maximize)
    delay 0.5
    
    -- iTerm2 on left display
    tell application "iTerm" to activate
    delay 0.5
    my triggerRectangle(nextDisplay)
    my triggerRectangle(nextDisplay)
    delay 0.5
    my triggerRectangle(maximize)
    delay 0.5
    
    -- Save as Moom layout
    tell application "Moom"
        save layout and replace "Full Stack Development"
    end tell
    
    display notification "Layout saved!" with title "Full Stack Development"
end createFullStackLayout

-- Layout 2: Code Review Mode
on createCodeReviewLayout()
    display notification "Creating Code Review Layout" with title "Moom Layout Creator"
    
    -- VS Code on main display left half
    tell application "Visual Studio Code" to activate
    delay 0.5
    my triggerRectangle(leftHalf)
    delay 0.5
    
    -- Edge on main display right half
    tell application "Microsoft Edge" to activate
    delay 0.5
    my triggerRectangle(rightHalf)
    delay 0.5
    
    -- Perplexity on right display
    tell application "Perplexity" to activate
    delay 0.5
    my triggerRectangle(nextDisplay)
    delay 0.5
    my triggerRectangle(maximize)
    delay 0.5
    
    -- Save as Moom layout
    tell application "Moom"
        save layout and replace "Code Review Mode"
    end tell
    
    display notification "Layout saved!" with title "Code Review Mode"
end createCodeReviewLayout

-- Layout 3: Research & Development
on createResearchLayout()
    display notification "Creating Research & Development Layout" with title "Moom Layout Creator"
    
    -- Perplexity on left display
    tell application "Perplexity" to activate
    delay 0.5
    -- Move to left display (adjust based on your setup)
    repeat 2 times
        my triggerRectangle(nextDisplay)
        delay 0.3
    end repeat
    my triggerRectangle(maximize)
    delay 0.5
    
    -- VS Code on main display
    tell application "Visual Studio Code" to activate
    delay 0.5
    my triggerRectangle(maximize)
    delay 0.5
    
    -- Edge on right display
    tell application "Microsoft Edge" to activate
    delay 0.5
    my triggerRectangle(nextDisplay)
    delay 0.5
    my triggerRectangle(maximize)
    delay 0.5
    
    -- Save as Moom layout
    tell application "Moom"
        save layout and replace "Research & Development"
    end tell
    
    display notification "Layout saved!" with title "Research & Development"
end createResearchLayout

-- Layout 4: Xcode iOS Development
on createXcodeLayout()
    display notification "Creating Xcode iOS Development Layout" with title "Moom Layout Creator"
    
    -- Xcode on main display
    tell application "Xcode" to activate
    delay 0.5
    my triggerRectangle(maximize)
    delay 0.5
    
    -- Simulator on right display top half
    tell application "Simulator" to activate
    delay 0.5
    my triggerRectangle(nextDisplay)
    delay 0.5
    my triggerRectangle(topHalf)
    delay 0.5
    
    -- iTerm on right display bottom half
    tell application "iTerm" to activate
    delay 0.5
    my triggerRectangle(bottomHalf)
    delay 0.5
    
    -- Save as Moom layout
    tell application "Moom"
        save layout and replace "Xcode iOS Development"
    end tell
    
    display notification "Layout saved!" with title "Xcode iOS Development"
end createXcodeLayout

-- Main execution
display dialog "Which layout would you like to create?" buttons {"Full Stack", "Code Review", "Research", "Xcode", "All"} default button 5
set layoutChoice to button returned of result

if layoutChoice is "Full Stack" then
    createFullStackLayout()
else if layoutChoice is "Code Review" then
    createCodeReviewLayout()
else if layoutChoice is "Research" then
    createResearchLayout()
else if layoutChoice is "Xcode" then
    createXcodeLayout()
else if layoutChoice is "All" then
    createFullStackLayout()
    delay 2
    createCodeReviewLayout()
    delay 2
    createResearchLayout()
    delay 2
    createXcodeLayout()
    display notification "All layouts created!" with title "Moom Layout Creator"
end if