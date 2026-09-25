# index.html

In packages/website, currently the index.html file is generated from a template, now remove this index and instead make a manual html file to replace it:
- packages/website/assets/index.html
- packages/website/assets/homeres folder to store any assets **EXCLUSIVELY** used by index page, include images, css, anything.

## Content of index.html

- Logo and name "Gaclib"
- A tab with source code and result
  - A hello world message box using easy layout.
  - A simple data binding demo, typing name and say hello below.
- Introduction to supported platforms
  - Windows, Linux, MacOS, HTML5 tab pages
    - Each title lists supported renderers in tab header
      - DirectX, GDI, TUI
      - Wayland, TUI
      - Cocoa, TUI
      - HTML5
    - Screenshots as content, copied from GacUI, wGac, iGac, GacJS
      - GUI/TUI has vertical tabs to select color theme
      - A powershell script to copy all of them.
      - Resized to same height in html
- Getting started and other links as icon + text
- Detailed feature lists, including data bindjng, workflow script, remote protocol, etc
  - Each feature rendered as group box, with short description and optional sample code in it
- The whole page could be rendered as GUI/TUI, totally controlled by CSS.

## MSIC

Rename all `assest` folders with any other "assets" typos to `assets`, as well as literals in code, rebuild and run the website to make sure the renaming works:
- In `packages/website(-doc[12])?`
