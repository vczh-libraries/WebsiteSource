# Native homepage samples

`hello.xml` and `binding.xml` are the exact `Instance` resources shown on the homepage. Their PNGs are unmodified captures of GacUI's Windows Direct2D renderer with the default DarkSkin, not browser recreations.

Both examples use one Easy Layout with five-pixel spacing. `ClientSize` requests the width and lets minimum-size propagation determine the height. The OK button has a 72 by 26 minimum size; the textbox fills its row with a minimum height of 26. The captured windows measure 320 by 102 and 360 by 123 pixels respectively.

The binding screenshot was captured after focusing the textbox, selecting its initial `world` text, and typing `GacUI` through GacUI's automation endpoint. The bound label changed to `Hello, GacUI!`. UI Automation also verified the textbox value and greeting, and a separate SetValue round trip changed the greeting to `Hello, Reader!` and back. The hello dialog's OK event was exercised through the automation endpoint and closed the process normally.

## Recreating the captures

Use a current `GacUI/Test/GacUISrc/x64/Debug/Playground.exe`, built with the repository's build wrapper. The current Playground loads `Playground/Resources/ResourceUiaReview.xml` relative to the solution layout and instantiates `demo::TestWindow`.

1. Create a temporary folder containing `x64/Debug/Playground.exe`, copied from that build, plus a copy of `GacUISrc.sln`. No upstream source changes are needed.
2. Create `Playground/Resources/ResourceUiaReview.xml` there. Wrap the selected sample in `<Resource><Instance name="MainWindowResource">` and `</Instance></Resource>`.
3. Add a temporary `Playground/Playground.vcxproj.user` with `LocalDebuggerCommandArguments` set to `/AsPort:8987` for `Debug|x64`. Choose a free port if necessary.
4. From the temporary solution folder, run the repository's `copilotExecute.ps1 -Mode CLI -Executable Playground -Configuration Debug -Platform x64`. The default renderer is Direct2D; do not pass `/UiaGdi`.
5. Inspect `http://localhost:8987/Automation/Playground/Controls`. For the binding sample, POST `!LeftClick:160,76`, `!KeyPress:CTRL+A`, then `!Type:GacUI` to `/Automation/Playground/IO`. The required content type is exactly `application/json; charset=utf8`; PowerShell 7's `Invoke-RestMethod` needs `-SkipHeaderValidation` for this spelling.
6. Capture the actual application HWND with Win32 `PrintWindow` using `PW_RENDERFULLCONTENT` (2) into a window-sized bitmap, then save as PNG. Inspect the pixels and confirm the greeting before replacing the committed image.
7. Close the hello sample with `!LeftClick:270,76`, or send `!Exit` to the same IO endpoint. Wait for the process and its execution wrapper to exit before starting the other sample on the same port. Stop every process created for capture and discard the temporary folder.

The temporary capture fixture is not committed and is not needed to serve the website. These coordinates and screenshot dimensions correspond to the captured 100% DPI environment; derive fresh control bounds at other DPI settings.
