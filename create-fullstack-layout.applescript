#!/usr/bin/env osascript

-- Rectangle + Moom Layout Creator
-- Creates developer layouts using Rectangle for window positioning

-- Rectangle default shortcuts (adjust if you've customized them)
on moveWindowLeft()
    tell application "System Events"
        key code 123 using {control down, option down} -- left arrow
    end tell
    delay 0.5
end moveWindowLeft

on moveWindowRight()
    tell application "System Events"
        key code 124 using {control down, option down} -- right arrow
    end tell
    delay 0.5
end moveWindowRight

on maximizeWindow()
    tell application "System Events"
        key code 36 using {control down, option down} -- return/enter
    end tell
    delay 0.5
end maximizeWindow

on moveToNextDisplay()
    tell application "System Events"
        key code 124 using {control down, option down, command down} -- right arrow
    end tell
    delay 0.8
end moveToNextDisplay

-- Create Full Stack Development Layout
tell application "Visual Studio Code" to activate
delay 0.5
maximizeWindow()

tell application "Microsoft Edge" to activate
delay 0.5
moveToNextDisplay()
maximizeWindow()

tell application "iTerm" to activate
delay 0.5
moveToNextDisplay()
moveToNextDisplay()
maximizeWindow()

-- Save the layout
tell application "Moom"
    save layout and replace "Full Stack Dev"
end tell

display notification "Full Stack Dev layout created!" with title "Layout Saved"